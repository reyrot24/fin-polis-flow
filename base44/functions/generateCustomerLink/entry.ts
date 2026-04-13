import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { financing_request_id, expiration_days = 7, customer_email, customer_name, send_method = 'email' } = await req.json();

  if (!financing_request_id) return Response.json({ error: 'ID pratica mancante' }, { status: 400 });

  // Fetch the practice
  const records = await base44.asServiceRole.entities.FinancingRequest.filter({ id: financing_request_id });
  if (!records.length) return Response.json({ error: 'Pratica non trovata' }, { status: 404 });

  const record = records[0];

  // Revoke old active links for this practice
  const oldLinks = await base44.asServiceRole.entities.CustomerLink.filter({ financing_request_id });
  for (const link of oldLinks) {
    if (!['expired', 'revoked', 'submitted'].includes(link.status)) {
      await base44.asServiceRole.entities.CustomerLink.update(link.id, { status: 'revoked' });
    }
  }

  // Generate new token
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiration_days * 24 * 60 * 60 * 1000);

  const linkRecord = await base44.asServiceRole.entities.CustomerLink.create({
    token,
    pratica_id: record.pratica_id || financing_request_id,
    financing_request_id,
    status: 'generated',
    expires_at: expiresAt.toISOString(),
    expiration_days,
    generated_at: now.toISOString(),
    customer_email: customer_email || record.email || '',
    customer_name: customer_name || (record.nome && record.cognome ? `${record.nome} ${record.cognome}` : ''),
    send_method,
    open_count: 0,
    regeneration_count: (oldLinks.length > 0 ? (oldLinks[oldLinks.length - 1].regeneration_count || 0) + 1 : 0),
  });

  // Update practice status
  await base44.asServiceRole.entities.FinancingRequest.update(financing_request_id, {
    stato_pratica: 'incompleta'
  });

  return Response.json({
    success: true,
    token,
    link_id: linkRecord.id,
    expires_at: expiresAt.toISOString(),
    url: `/intake/${token}`,
  });
});
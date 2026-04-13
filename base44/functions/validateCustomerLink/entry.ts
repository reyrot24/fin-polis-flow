import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { token } = await req.json();
  if (!token) return Response.json({ error: 'Token mancante' }, { status: 400 });

  const links = await base44.asServiceRole.entities.CustomerLink.filter({ token });
  if (!links.length) return Response.json({ error: 'Link non valido' }, { status: 404 });

  const link = links[0];

  // Check revoked
  if (link.status === 'revoked') return Response.json({ error: 'Link revocato', code: 'revoked' }, { status: 403 });
  if (link.status === 'submitted') {
    // Still allow viewing submitted data
    const records = await base44.asServiceRole.entities.FinancingRequest.filter({ id: link.financing_request_id });
    return Response.json({ success: true, link, data: records[0] || {}, readonly: true });
  }

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    await base44.asServiceRole.entities.CustomerLink.update(link.id, { status: 'expired' });
    return Response.json({ error: 'Link scaduto', code: 'expired' }, { status: 410 });
  }

  // Track access
  const now = new Date().toISOString();
  const accessLog = link.access_log || [];
  accessLog.push({ ts: now, ua: req.headers.get('user-agent') || '' });

  const updateData = {
    last_activity_at: now,
    open_count: (link.open_count || 0) + 1,
    access_log: accessLog.slice(-20), // keep last 20
  };
  if (!link.first_opened_at) updateData.first_opened_at = now;
  if (link.status === 'generated' || link.status === 'sent') updateData.status = 'opened';

  await base44.asServiceRole.entities.CustomerLink.update(link.id, updateData);

  // Fetch practice data
  const records = await base44.asServiceRole.entities.FinancingRequest.filter({ id: link.financing_request_id });
  if (!records.length) return Response.json({ error: 'Pratica non trovata' }, { status: 404 });

  return Response.json({
    success: true,
    link: { ...link, ...updateData },
    data: records[0],
    readonly: false,
  });
});
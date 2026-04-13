import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { token, form_data, consent_log, is_draft = false } = await req.json();
  if (!token) return Response.json({ error: 'Token mancante' }, { status: 400 });

  const links = await base44.asServiceRole.entities.CustomerLink.filter({ token });
  if (!links.length) return Response.json({ error: 'Link non valido' }, { status: 404 });

  const link = links[0];

  if (link.status === 'revoked') return Response.json({ error: 'Link revocato' }, { status: 403 });
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    await base44.asServiceRole.entities.CustomerLink.update(link.id, { status: 'expired' });
    return Response.json({ error: 'Link scaduto' }, { status: 410 });
  }

  const now = new Date().toISOString();

  // Tag each field with who entered it
  const fields_metadata = { ...(form_data.fields_metadata || {}) };

  // Save the updated practice
  const updatePayload = {
    ...form_data,
    fields_metadata,
    last_saved: now,
  };

  if (!is_draft) {
    // Final submission
    updatePayload.stato_pratica = 'inviata';
    updatePayload.data_conferma = now;
    updatePayload.completato_da = 'cliente';

    // Update link status
    await base44.asServiceRole.entities.CustomerLink.update(link.id, {
      status: 'submitted',
      submitted_at: now,
      last_activity_at: now,
      completion_percentage: form_data.completion_percentage || 100,
      consent_log: consent_log || {},
    });
  } else {
    // Draft save
    updatePayload.stato_pratica = form_data.stato_pratica === 'inviata' ? 'inviata' : 'incompleta';
    await base44.asServiceRole.entities.CustomerLink.update(link.id, {
      status: 'in_progress',
      last_activity_at: now,
      completion_percentage: form_data.completion_percentage || 0,
    });
  }

  await base44.asServiceRole.entities.FinancingRequest.update(link.financing_request_id, updatePayload);

  return Response.json({
    success: true,
    is_draft,
    submitted_at: is_draft ? null : now,
    pratica_id: link.pratica_id,
  });
});
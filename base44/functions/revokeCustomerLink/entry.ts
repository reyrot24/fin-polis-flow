import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { link_id } = await req.json();
  if (!link_id) return Response.json({ error: 'ID link mancante' }, { status: 400 });

  await base44.asServiceRole.entities.CustomerLink.update(link_id, {
    status: 'revoked',
  });

  return Response.json({ success: true });
});
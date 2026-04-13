import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { link_id, method = 'email' } = await req.json();
  if (!link_id) return Response.json({ error: 'ID link mancante' }, { status: 400 });

  const links = await base44.asServiceRole.entities.CustomerLink.filter({ id: link_id });
  if (!links.length) return Response.json({ error: 'Link non trovato' }, { status: 404 });

  const link = links[0];
  const appUrl = req.headers.get('origin') || 'https://app.base44.com';
  const intakeUrl = `${appUrl}/intake/${link.token}`;

  let emailSent = false;
  let emailError = null;

  if (method === 'email' && link.customer_email) {
    const customerName = link.customer_name || 'Cliente';
    const firstName = customerName.split(' ')[0];
    const expiryDate = new Date(link.expires_at).toLocaleDateString('it-IT');

    const htmlBody = [
      '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">',
      '<div style="background: #1e3a5f; padding: 24px; border-radius: 12px 12px 0 0;">',
      '<h2 style="color: white; margin: 0; font-size: 18px;">Richiesta di Finanziamento Polizza</h2>',
      '</div>',
      '<div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">',
      '<p style="font-size: 16px;">Gentile <strong>' + firstName + '</strong>,</p>',
      '<p>Ti inviamo il link per completare la richiesta di finanziamento relativa alla tua polizza.</p>',
      '<p style="background: #f0f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #1e3a5f;">',
      '<strong>Abbiamo gia inserito parte dei tuoi dati.</strong><br>',
      'Ti chiediamo solo di verificare le informazioni e completare i dati mancanti.<br>',
      '<em>La procedura richiede solo pochi minuti.</em>',
      '</p>',
      '<div style="text-align: center; margin: 32px 0;">',
      '<a href="' + intakeUrl + '" style="background: #1e3a5f; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">',
      'Completa la richiesta',
      '</a>',
      '</div>',
      '<p style="font-size: 12px; color: #64748b;">',
      'Il link e valido fino al ' + expiryDate + '.<br>',
      'Puoi riprendere la compilazione in qualsiasi momento finche il link e attivo.<br>',
      'Se non hai richiesto questa comunicazione, ignora questa email.',
      '</p>',
      '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">',
      '<p style="font-size: 11px; color: #94a3b8;">Pratica n. ' + link.pratica_id + '</p>',
      '</div></body></html>',
    ].join('');

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: link.customer_email,
        subject: 'Completa la tua richiesta di finanziamento polizza',
        body: htmlBody,
      });
      emailSent = true;
    } catch (err) {
      // Base44 SendEmail only works for registered app users.
      // Catch the error and return the link so the operator can copy/share it manually.
      emailError = err.message || 'send_failed';
    }
  }

  await base44.asServiceRole.entities.CustomerLink.update(link_id, {
    status: link.status === 'generated' ? 'sent' : link.status,
    sent_at: new Date().toISOString(),
    send_method: method,
  });

  if (!emailSent && emailError) {
    return Response.json({
      success: false,
      email_sent: false,
      email_error: emailError,
      intake_url: intakeUrl,
      message: 'Email non inviata: il destinatario non e un utente registrato. Condividi il link manualmente.',
    }, { status: 200 });
  }

  return Response.json({ success: true, method, sent_to: link.customer_email, email_sent: emailSent, intake_url: intakeUrl });
});
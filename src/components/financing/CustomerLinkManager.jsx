import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Link2, Send, Copy, RefreshCw, Ban, Mail, MessageSquare, CheckCircle2, Clock, AlertCircle, XCircle, Loader2, ExternalLink, Eye
} from 'lucide-react';
import moment from 'moment';

const STATUS_CONFIG = {
  generated: { label: 'Generato', icon: Link2, color: 'text-muted-foreground bg-muted' },
  sent: { label: 'Inviato', icon: Send, color: 'text-primary bg-primary/10' },
  opened: { label: 'Aperto', icon: Eye, color: 'text-accent bg-accent/10' },
  in_progress: { label: 'In compilazione', icon: Clock, color: 'text-warning bg-warning/10' },
  submitted: { label: 'Inviato dal cliente', icon: CheckCircle2, color: 'text-success bg-success/10' },
  expired: { label: 'Scaduto', icon: AlertCircle, color: 'text-warning bg-warning/10' },
  revoked: { label: 'Revocato', icon: XCircle, color: 'text-destructive bg-destructive/10' },
};

export default function CustomerLinkManager({ financingRequestId, praticaId, customerEmail, customerName }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [expirationDays, setExpirationDays] = useState('7');
  const [sendEmail, setSendEmail] = useState(customerEmail || '');

  const activeLink = links.find(l => !['revoked', 'expired'].includes(l.status));

  useEffect(() => {
    loadLinks();
  }, [financingRequestId]);

  async function loadLinks() {
    setLoading(true);
    const data = await base44.entities.CustomerLink.filter({ financing_request_id: financingRequestId });
    data.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
    setLinks(data);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    await base44.functions.invoke('generateCustomerLink', {
      financing_request_id: financingRequestId,
      expiration_days: parseInt(expirationDays),
      customer_email: sendEmail,
      customer_name: customerName,
    });
    await loadLinks();
    setGenerating(false);
  }

  async function handleSendEmail() {
    if (!activeLink) return;
    setSending(true);
    setSendResult(null);
    const res = await base44.functions.invoke('sendCustomerLink', { link_id: activeLink.id, method: 'email' });
    await loadLinks();
    setSending(false);
    setSendResult(res.data);
  }

  async function handleRevoke() {
    if (!activeLink) return;
    await base44.functions.invoke('revokeCustomerLink', { link_id: activeLink.id });
    await loadLinks();
  }

  function buildIntakeUrl(token) {
    return `${window.location.origin}/intake/${token}`;
  }

  async function handleCopy() {
    if (!activeLink) return;
    await navigator.clipboard.writeText(buildIntakeUrl(activeLink.token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsappText(link) {
    const name = (link.customer_name || 'Cliente').split(' ')[0];
    const url = buildIntakeUrl(link.token);
    return `Ciao ${name}, ti inviamo il link per completare la richiesta collegata alla tua polizza. Abbiamo già inserito parte dei dati. Ti basterà verificare e completare quelli mancanti: ${url}`;
  }

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Link Cliente</h3>
      </div>

      {!activeLink ? (
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-3">Nessun link attivo. Genera un link sicuro da inviare al cliente.</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Input
              placeholder="Email cliente"
              value={sendEmail}
              onChange={e => setSendEmail(e.target.value)}
              className="text-xs"
            />
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger className="w-full sm:w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 giorni</SelectItem>
                <SelectItem value="7">7 giorni</SelectItem>
                <SelectItem value="14">14 giorni</SelectItem>
                <SelectItem value="30">30 giorni</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={generating} className="gap-2 w-full">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            Genera link sicuro
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Status card */}
          {(() => {
            const cfg = STATUS_CONFIG[activeLink.status] || STATUS_CONFIG.generated;
            const Icon = cfg.icon;
            return (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Scade: {moment(activeLink.expires_at).format('DD/MM/YY')}
                  </span>
                </div>

                {/* URL display */}
                <div className="bg-muted/50 rounded-lg p-2.5 mb-3 font-mono text-[10px] text-muted-foreground break-all select-all">
                  {buildIntakeUrl(activeLink.token)}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  {[
                    { label: 'Aperture', value: activeLink.open_count || 0 },
                    { label: 'Completamento', value: `${activeLink.completion_percentage || 0}%` },
                    { label: 'Prima apertura', value: activeLink.first_opened_at ? moment(activeLink.first_opened_at).format('DD/MM HH:mm') : '—' },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs font-semibold text-foreground">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="space-y-1 text-[10px] text-muted-foreground mb-3">
                  {activeLink.generated_at && <p>🔗 Generato: {moment(activeLink.generated_at).format('DD/MM/YY HH:mm')}</p>}
                  {activeLink.sent_at && <p>📤 Inviato: {moment(activeLink.sent_at).format('DD/MM/YY HH:mm')}</p>}
                  {activeLink.first_opened_at && <p>👁 Aperto: {moment(activeLink.first_opened_at).format('DD/MM/YY HH:mm')}</p>}
                  {activeLink.last_activity_at && <p>⏱ Ultima attività: {moment(activeLink.last_activity_at).format('DD/MM/YY HH:mm')}</p>}
                  {activeLink.submitted_at && <p>✅ Inviato dal cliente: {moment(activeLink.submitted_at).format('DD/MM/YY HH:mm')}</p>}
                </div>

                {sendResult && !sendResult.email_sent && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-2.5 mb-2">
                    <p className="text-[10px] font-medium text-warning mb-1">Email non inviata automaticamente</p>
                    <p className="text-[10px] text-muted-foreground">{sendResult.message}</p>
                  </div>
                )}
                {sendResult && sendResult.email_sent && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-2.5 mb-2">
                    <p className="text-[10px] font-medium text-success">Email inviata con successo</p>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiato!' : 'Copia link'}
                  </Button>
                  <a href={buildIntakeUrl(activeLink.token)} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Anteprima
                    </Button>
                  </a>
                  <Button size="sm" variant="outline" onClick={handleSendEmail} disabled={sending || !sendEmail} className="gap-1.5 text-xs">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Invia email
                  </Button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(whatsappText(activeLink))}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
                </div>
                );
                })()}

          {/* Regenerate / revoke */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating} className="gap-1.5 text-xs flex-1">
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Rigenera
            </Button>
            <Button size="sm" variant="outline" onClick={handleRevoke} className="gap-1.5 text-xs text-destructive hover:text-destructive">
              <Ban className="w-3.5 h-3.5" />
              Revoca
            </Button>
          </div>

          {sendEmail && (
            <Input placeholder="Email cliente" value={sendEmail} onChange={e => setSendEmail(e.target.value)} className="text-xs" />
          )}
        </div>
      )}
    </div>
  );
}
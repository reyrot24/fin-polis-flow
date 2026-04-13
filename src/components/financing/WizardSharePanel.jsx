import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Mail, MessageSquare, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp, Send } from 'lucide-react';

export default function WizardSharePanel({ recordId, praticaId, customerEmail, customerName }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(customerEmail || '');
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    if (open && recordId) loadLink();
  }, [open, recordId]);

  // sync email from parent
  useEffect(() => {
    if (customerEmail) setEmail(customerEmail);
  }, [customerEmail]);

  async function loadLink() {
    setLoading(true);
    const links = await base44.entities.CustomerLink.filter({ financing_request_id: recordId });
    const active = links.find(l => !['revoked', 'expired'].includes(l.status));
    setLink(active || null);
    setLoading(false);
  }

  async function handleGenerate() {
    if (!recordId) return;
    setGenerating(true);
    await base44.functions.invoke('generateCustomerLink', {
      financing_request_id: recordId,
      expiration_days: 7,
      customer_email: email,
      customer_name: customerName,
    });
    await loadLink();
    setGenerating(false);
  }

  async function handleSendEmail() {
    if (!link) return;
    setSending(true);
    setSendResult(null);
    const res = await base44.functions.invoke('sendCustomerLink', { link_id: link.id, method: 'email' });
    setSendResult(res.data);
    setSending(false);
  }

  function intakeUrl() {
    if (!link) return '';
    return `${window.location.origin}/intake/${link.token}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(intakeUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsappText() {
    const name = (customerName || 'Cliente').split(' ')[0];
    return `Ciao ${name}, ti inviamo il link per completare la tua richiesta di finanziamento. Abbiamo già inserito parte dei dati. Ti basterà verificare e completare quelli mancanti: ${intakeUrl()}`;
  }

  return (
    <div className="mt-4 border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Condividi questionario con il cliente
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-card">
          {!recordId ? (
            <p className="text-xs text-muted-foreground">Salva prima la pratica per poter generare il link.</p>
          ) : loading ? (
            <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : !link ? (
            <>
              <p className="text-xs text-muted-foreground">Genera un link sicuro da inviare al cliente per completare il questionario.</p>
              <Input
                placeholder="Email cliente"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="text-xs"
              />
              <Button size="sm" onClick={handleGenerate} disabled={generating} className="w-full gap-2">
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Genera link
              </Button>
            </>
          ) : (
            <>
              <div className="bg-muted/50 rounded-lg p-2.5 font-mono text-[10px] text-muted-foreground break-all select-all">
                {intakeUrl()}
              </div>

              <Input
                placeholder="Email cliente"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="text-xs"
              />

              {sendResult && !sendResult.email_sent && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-2.5">
                  <p className="text-[10px] text-warning font-medium">Email non inviata automaticamente</p>
                  <p className="text-[10px] text-muted-foreground">Condividi il link manualmente tramite copia o WhatsApp.</p>
                </div>
              )}
              {sendResult && sendResult.email_sent && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-2.5">
                  <p className="text-[10px] text-success font-medium">Email inviata con successo!</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiato!' : 'Copia'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleSendEmail} disabled={sending || !email} className="gap-1.5 text-xs">
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Email
                </Button>
                <a href={`https://wa.me/?text=${encodeURIComponent(whatsappText())}`} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
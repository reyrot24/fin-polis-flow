import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SummaryView from '@/components/financing/SummaryView';
import CustomerLinkManager from '@/components/financing/CustomerLinkManager';
import { ArrowLeft, Download, Edit, Shield, Clock, User, FileText, AlertTriangle } from 'lucide-react';
import moment from 'moment';

export default function PraticaDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const records = await base44.entities.FinancingRequest.filter({ id });
        if (records.length > 0) setData(records[0]);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDownloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pratica-${data.pratica_id || data.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Pratica non trovata</p>
          <Link to="/admin"><Button variant="link" className="mt-2">Torna alla lista</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Pratica {data.pratica_id}</h1>
              <p className="text-[10px] text-muted-foreground">Dettaglio richiesta</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadJSON} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              JSON
            </Button>
            {data.stato_pratica !== 'inviata' && (
              <Link to={`/?record_id=${data.id}`}>
                <Button size="sm" className="gap-1.5 text-xs">
                  <Edit className="w-3.5 h-3.5" />
                  Modifica
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Richiedente</p>
              <p className="text-sm font-medium">{data.cognome && data.nome ? `${data.cognome} ${data.nome}` : '—'}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ultima modifica</p>
              <p className="text-sm font-medium">{data.updated_date ? moment(data.updated_date).format('DD/MM/YY HH:mm') : '—'}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completamento</p>
              <p className="text-sm font-medium">{data.completion_percentage || 0}%</p>
            </div>
          </div>
        </div>

        {data.campi_mancanti?.length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-sm font-medium text-foreground">Campi mancanti ({data.campi_mancanti.length})</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.campi_mancanti.map(f => (
                <span key={f} className="text-xs bg-warning/20 text-foreground px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
            <SummaryView data={data} />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <CustomerLinkManager
              financingRequestId={data.id}
              praticaId={data.pratica_id}
              customerEmail={data.email}
              customerName={data.nome && data.cognome ? `${data.nome} ${data.cognome}` : ''}
            />
          </div>
        </div>

        {(data.log_importati?.length > 0 || data.log_modificati?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.log_importati?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Campi importati dalla piattaforma</h4>
                <div className="flex flex-wrap gap-1">
                  {data.log_importati.map(f => (
                    <span key={f} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}
            {data.log_modificati?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Campi modificati dal cliente</h4>
                <div className="flex flex-wrap gap-1">
                  {data.log_modificati.map(f => (
                    <span key={f} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
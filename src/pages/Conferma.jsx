import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SummaryView from '@/components/financing/SummaryView';
import { CheckCircle2, ArrowLeft, Download, Edit, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Conferma() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams(window.location.search);
      const recordId = params.get('record_id');
      if (recordId) {
        const records = await base44.entities.FinancingRequest.filter({ id: recordId });
        if (records.length > 0) setData(records[0]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleDownloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pratica-${data.pratica_id || 'export'}.json`;
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
          <Link to="/">
            <Button variant="link" className="mt-2">Torna alla home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-sm font-semibold text-foreground">Richiesta Finanziamento</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Richiesta inviata!</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            La tua richiesta di finanziamento è stata inviata con successo. Riceverai una conferma via email.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pratica: <span className="font-mono font-medium">{data.pratica_id}</span>
          </p>
        </motion.div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm mb-6">
          <SummaryView data={data} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={handleDownloadJSON} className="gap-2 flex-1">
            <Download className="w-4 h-4" />
            Scarica riepilogo
          </Button>
          {data.stato_pratica !== 'inviata' && (
            <Link to={`/?record_id=${data.id}`} className="flex-1">
              <Button variant="outline" className="gap-2 w-full">
                <Edit className="w-4 h-4" />
                Modifica dati
              </Button>
            </Link>
          )}
          <Link to="/admin" className="flex-1">
            <Button className="gap-2 w-full">
              <ArrowLeft className="w-4 h-4" />
              Torna alle pratiche
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
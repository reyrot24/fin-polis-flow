import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, Plus, Eye, Download, FileText, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import moment from 'moment';

const STATUS_CONFIG = {
  bozza: { label: 'Bozza', icon: Clock, color: 'bg-muted text-muted-foreground' },
  incompleta: { label: 'Incompleta', icon: AlertCircle, color: 'bg-warning/10 text-warning' },
  completata: { label: 'Completata', icon: CheckCircle2, color: 'bg-success/10 text-success' },
  inviata: { label: 'Inviata', icon: Send, color: 'bg-primary/10 text-primary' },
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const data = await base44.entities.FinancingRequest.list('-updated_date', 100);
      setRequests(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = requests.filter(r => {
    if (filterStatus !== 'all' && r.stato_pratica !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (r.pratica_id || '').toLowerCase().includes(s)
        || (r.cognome || '').toLowerCase().includes(s)
        || (r.nome || '').toLowerCase().includes(s)
        || (r.codice_fiscale || '').toLowerCase().includes(s);
    }
    return true;
  });

  const stats = {
    totali: requests.length,
    bozza: requests.filter(r => r.stato_pratica === 'bozza').length,
    incompleta: requests.filter(r => r.stato_pratica === 'incompleta').length,
    completata: requests.filter(r => r.stato_pratica === 'completata').length,
    inviata: requests.filter(r => r.stato_pratica === 'inviata').length,
  };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pratiche-export-${moment().format('YYYY-MM-DD')}.json`;
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Gestione Pratiche</h1>
              <p className="text-[10px] text-muted-foreground">Pannello di controllo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportAll} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              Esporta
            </Button>
            <Link to="/">
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Nuova pratica
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Totali', value: stats.totali, color: 'bg-primary/10 text-primary' },
            { label: 'Bozza', value: stats.bozza, color: 'bg-muted text-muted-foreground' },
            { label: 'Incomplete', value: stats.incompleta, color: 'bg-warning/10 text-warning' },
            { label: 'Complete', value: stats.completata, color: 'bg-success/10 text-success' },
            { label: 'Inviate', value: stats.inviata, color: 'bg-primary/10 text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cerca per ID, nome, cognome, CF..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="bozza">Bozza</SelectItem>
              <SelectItem value="incompleta">Incompleta</SelectItem>
              <SelectItem value="completata">Completata</SelectItem>
              <SelectItem value="inviata">Inviata</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nessuna pratica trovata</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(req => {
              const status = STATUS_CONFIG[req.stato_pratica] || STATUS_CONFIG.bozza;
              const StatusIcon = status.icon;
              return (
                <Link key={req.id} to={`/admin/pratica/${req.id}`} className="block">
                  <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {req.cognome && req.nome ? `${req.cognome} ${req.nome}` : 'Dati non inseriti'}
                            </p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono">{req.pratica_id}</span>
                            {req.completion_percentage !== undefined && (
                              <span className="text-xs text-muted-foreground">{req.completion_percentage}%</span>
                            )}
                            {req.campi_mancanti?.length > 0 && (
                              <span className="text-xs text-warning">{req.campi_mancanti.length} mancanti</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-[10px] text-muted-foreground">
                          {req.updated_date ? moment(req.updated_date).format('DD/MM/YY HH:mm') : ''}
                        </p>
                        <Eye className="w-3.5 h-3.5 text-muted-foreground mt-1 ml-auto" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
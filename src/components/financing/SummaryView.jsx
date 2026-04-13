import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STEPS } from '@/lib/stepConfig';

const STATUS_MAP = {
  bozza: { label: 'Bozza', color: 'bg-muted text-muted-foreground' },
  incompleta: { label: 'Incompleta', color: 'bg-warning/10 text-warning' },
  completata: { label: 'Completata', color: 'bg-success/10 text-success' },
  inviata: { label: 'Inviata', color: 'bg-primary/10 text-primary' },
};

const SECTION_FIELDS = {
  'Pratica': ['pratica_id', 'numero_preventivo', 'numero_polizza', 'intermediario', 'prodotto_compagnia', 'importo_finanziare', 'premio_polizza', 'data_apertura'],
  'Soggetto': ['tipo_soggetto', 'ha_coobbligato', 'grado_parentela'],
  'Anagrafica': ['cognome', 'nome', 'data_nascita', 'luogo_nascita', 'codice_fiscale', 'sesso', 'stato_civile'],
  'Residenza': ['residenza_indirizzo', 'residenza_civico', 'residenza_cap', 'residenza_localita', 'residenza_provincia', 'tipo_abitazione'],
  'Recapiti': ['cellulare', 'email', 'telefono_fisso'],
  'Documento': ['tipo_documento', 'numero_documento', 'data_rilascio', 'ente_rilascio'],
  'Cittadinanza': ['cittadinanza', 'cittadinanza_altra'],
  'Occupazione': ['attivita_lavorativa', 'settore_attivita', 'tipo_assunzione'],
  'Datore': ['datore_ragione_sociale', 'datore_localita'],
  'Reddito': ['tipo_reddito', 'numero_mensilita', 'reddito'],
  'Socio-Demografici': ['numero_familiari', 'rapporto_banca_posta', 'carta_credito'],
  'Pagamento': ['modalita_pagamento', 'codice_iban', 'intestatario_conto'],
};

const LABELS = {
  pratica_id: 'ID Pratica', numero_preventivo: 'N° Preventivo', numero_polizza: 'N° Polizza',
  intermediario: 'Intermediario', prodotto_compagnia: 'Prodotto', importo_finanziare: 'Importo',
  premio_polizza: 'Premio', data_apertura: 'Data Apertura', tipo_soggetto: 'Tipo Soggetto',
  ha_coobbligato: 'Coobbligato', grado_parentela: 'Parentela', cognome: 'Cognome', nome: 'Nome',
  data_nascita: 'Data Nascita', luogo_nascita: 'Luogo Nascita', codice_fiscale: 'Codice Fiscale',
  sesso: 'Sesso', stato_civile: 'Stato Civile', residenza_indirizzo: 'Indirizzo',
  residenza_civico: 'Civico', residenza_cap: 'CAP', residenza_localita: 'Località',
  residenza_provincia: 'Provincia', tipo_abitazione: 'Tipo Abitazione', cellulare: 'Cellulare',
  email: 'Email', telefono_fisso: 'Telefono Fisso', tipo_documento: 'Tipo Documento',
  numero_documento: 'N° Documento', data_rilascio: 'Data Rilascio', ente_rilascio: 'Ente Rilascio',
  cittadinanza: 'Cittadinanza', cittadinanza_altra: 'Specificare', attivita_lavorativa: 'Attività',
  settore_attivita: 'Settore', tipo_assunzione: 'Assunzione', datore_ragione_sociale: 'Ragione Sociale',
  datore_localita: 'Località', tipo_reddito: 'Tipo Reddito', numero_mensilita: 'Mensilità',
  reddito: 'Reddito', numero_familiari: 'Familiari', rapporto_banca_posta: 'Rapporto Bancario',
  carta_credito: 'Carta', modalita_pagamento: 'Modalità', codice_iban: 'IBAN',
  intestatario_conto: 'Intestatario',
};

function formatValue(key, value) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sì' : 'No';
  if (typeof value === 'number') {
    if (key.includes('importo') || key.includes('premio') || key === 'reddito') {
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    }
    return String(value);
  }
  return String(value);
}

export default function SummaryView({ data }) {
  const status = STATUS_MAP[data.stato_pratica] || STATUS_MAP.bozza;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Riepilogo dati</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>

      {Object.entries(SECTION_FIELDS).map(([section, fields]) => {
        const hasData = fields.some(f => data[f] !== undefined && data[f] !== null && data[f] !== '');
        if (!hasData) return null;

        return (
          <div key={section} className="bg-muted/30 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{section}</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {fields.map(f => {
                const val = data[f];
                if (val === undefined || val === null || val === '') return null;
                return (
                  <div key={f} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{LABELS[f] || f}</span>
                    <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">
                      {formatValue(f, val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, Edit3 } from 'lucide-react';

const FIELD_LABELS = {
  cognome: 'Cognome',
  nome: 'Nome',
  data_nascita: 'Data di nascita',
  luogo_nascita: 'Luogo di nascita',
  codice_fiscale: 'Codice Fiscale',
  sesso: 'Sesso',
  tipo_documento: 'Tipo documento',
  numero_documento: 'Numero documento',
  data_rilascio: 'Data rilascio',
  localita_rilascio: 'Luogo rilascio',
  ente_rilascio: 'Ente rilascio',
  cittadinanza: 'Cittadinanza',
  cittadinanza_altra: 'Nazionalità',
  residenza_indirizzo: 'Indirizzo',
  residenza_localita: 'Comune',
};

const FIELD_SECTIONS = [
  {
    title: '👤 Dati Anagrafici',
    fields: ['cognome', 'nome', 'data_nascita', 'luogo_nascita', 'codice_fiscale', 'sesso'],
  },
  {
    title: '📄 Documento di Identità',
    fields: ['tipo_documento', 'numero_documento', 'data_rilascio', 'localita_rilascio', 'ente_rilascio'],
  },
  {
    title: '🌍 Cittadinanza',
    fields: ['cittadinanza', 'cittadinanza_altra'],
  },
  {
    title: '🏠 Residenza (suggerita)',
    fields: ['residenza_indirizzo', 'residenza_localita'],
  },
];

function confidenceLabel(score) {
  if (score === undefined || score === null) return null;
  if (score >= 0.8) return { label: 'Alta', color: 'text-success bg-success/10', icon: CheckCircle2 };
  if (score >= 0.5) return { label: 'Media', color: 'text-warning bg-warning/10', icon: AlertTriangle };
  return { label: 'Bassa', color: 'text-destructive bg-destructive/10', icon: XCircle };
}

// Map form field names to confidence keys
function getConfidenceKey(field) {
  const map = {
    cognome: 'last_name', nome: 'first_name', data_nascita: 'birth_date',
    luogo_nascita: 'birth_place', codice_fiscale: 'tax_code', sesso: 'gender',
    numero_documento: 'document_number', data_rilascio: 'issue_date',
    localita_rilascio: 'issue_place', ente_rilascio: 'issuing_authority',
  };
  return map[field] || field;
}

function FieldRow({ fieldKey, value, confidence, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value || '');
  const conf = confidenceLabel(confidence);
  const Icon = conf?.icon;

  function handleSave() {
    onEdit(fieldKey, localVal);
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground">{FIELD_LABELS[fieldKey] || fieldKey}</p>
        {editing ? (
          <div className="flex gap-1.5 mt-1">
            <Input
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              className="h-7 text-xs py-0"
              autoFocus
            />
            <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs">✓</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 px-2 text-xs">✕</Button>
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {conf && (
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${conf.color}`}>
            <Icon className="w-2.5 h-2.5" />
            {conf.label}
          </span>
        )}
        {!editing && (
          <button onClick={() => { setLocalVal(value || ''); setEditing(true); }} className="text-muted-foreground hover:text-foreground p-0.5">
            <Edit3 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExtractionReview({ extraction, onConfirm, onRetry }) {
  const { extracted, formFields } = extraction;
  const [fields, setFields] = useState({ ...formFields });
  const confidence = extracted?.confidence || {};

  function handleEdit(key, val) {
    setFields(prev => ({ ...prev, [key]: val }));
  }

  const hasWarnings = extracted?.warnings?.length > 0;
  const needsReview = extracted?.needs_manual_review;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Dati rilevati automaticamente</h2>
        <p className="text-sm text-muted-foreground">Controlla le informazioni estratte e correggi eventuali errori</p>
      </div>

      {hasWarnings && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3">
          <p className="text-xs font-semibold text-warning mb-1">⚠️ Avvisi</p>
          {extracted.warnings.map((w, i) => <p key={i} className="text-xs text-muted-foreground">{w}</p>)}
        </div>
      )}

      {needsReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-800">Verifica richiesta</p>
          <p className="text-xs text-amber-700">Alcuni campi richiedono attenzione prima di proseguire.</p>
        </div>
      )}

      {/* Fields by section */}
      {FIELD_SECTIONS.map(section => {
        const sectionFields = section.fields.filter(f => fields[f] !== undefined && fields[f] !== null && fields[f] !== '');
        if (sectionFields.length === 0) return null;
        return (
          <div key={section.title} className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">{section.title}</h3>
            {sectionFields.map(field => (
              <FieldRow
                key={field}
                fieldKey={field}
                value={fields[field]}
                confidence={confidence[getConfidenceKey(field)]}
                onEdit={handleEdit}
              />
            ))}
          </div>
        );
      })}

      <p className="text-[10px] text-muted-foreground text-center">
        Puoi modificare qualsiasi valore toccando l'icona matita. Potrai correggere i dati anche nelle pagine successive.
      </p>

      <div className="space-y-2">
        <Button onClick={() => onConfirm(fields)} className="w-full gap-2" size="lg">
          Conferma e continua
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" onClick={onRetry} className="w-full text-sm text-muted-foreground gap-2">
          Ricarica documento
        </Button>
      </div>
    </div>
  );
}
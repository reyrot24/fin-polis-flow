import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FieldWrapper from '../FieldWrapper';

const STATO_CIVILE = ['Celibe / Nubile', 'Coniugato in Comunione di Beni', 'Coniugato in Separazione di Beni', 'Convivente', 'Separato/a', 'Divorziato/a', 'Vedovo/a'];

export default function Step3Anagrafica({ data, onChange, errors, metadata }) {
  const meta = (f) => metadata?.[f] || {};

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">I tuoi dati personali</h2>
        <p className="text-sm text-muted-foreground mt-1">Inserisci o verifica le informazioni anagrafiche</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="Cognome" required error={errors?.cognome} completed={!!data.cognome} locked={meta('cognome').editable === false} source={meta('cognome').source}>
          <Input value={data.cognome || ''} onChange={e => onChange('cognome', e.target.value)} placeholder="Il tuo cognome" />
        </FieldWrapper>

        <FieldWrapper label="Nome" required error={errors?.nome} completed={!!data.nome} locked={meta('nome').editable === false} source={meta('nome').source}>
          <Input value={data.nome || ''} onChange={e => onChange('nome', e.target.value)} placeholder="Il tuo nome" />
        </FieldWrapper>

        <FieldWrapper label="Data di nascita" required error={errors?.data_nascita} completed={!!data.data_nascita} locked={meta('data_nascita').editable === false} source={meta('data_nascita').source}>
          <Input type="date" value={data.data_nascita || ''} onChange={e => onChange('data_nascita', e.target.value)} />
        </FieldWrapper>

        <FieldWrapper label="Luogo di nascita" error={errors?.luogo_nascita} completed={!!data.luogo_nascita} locked={meta('luogo_nascita').editable === false} source={meta('luogo_nascita').source}>
          <Input value={data.luogo_nascita || ''} onChange={e => onChange('luogo_nascita', e.target.value)} placeholder="Comune di nascita" />
        </FieldWrapper>

        <div className="sm:col-span-2">
          <FieldWrapper label="Codice Fiscale" required error={errors?.codice_fiscale} completed={!!data.codice_fiscale} locked={meta('codice_fiscale').editable === false} source={meta('codice_fiscale').source} hint="16 caratteri alfanumerici">
            <Input value={data.codice_fiscale || ''} onChange={e => onChange('codice_fiscale', e.target.value.toUpperCase())} placeholder="RSSMRA85M01H501Z" maxLength={16} className="uppercase tracking-wider font-mono" />
          </FieldWrapper>
        </div>

        <FieldWrapper label="Sesso" required error={errors?.sesso} completed={!!data.sesso}>
          <div className="flex gap-2">
            {['Maschio', 'Femmina'].map(opt => (
              <button
                key={opt}
                onClick={() => onChange('sesso', opt)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-all
                  ${data.sesso === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </FieldWrapper>

        <FieldWrapper label="Stato Civile" error={errors?.stato_civile} completed={!!data.stato_civile}>
          <Select value={data.stato_civile || ''} onValueChange={v => onChange('stato_civile', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona stato civile" />
            </SelectTrigger>
            <SelectContent>
              {STATO_CIVILE.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>
    </div>
  );
}
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FieldWrapper from '../FieldWrapper';

const ATTIVITA = ['Dipendente', 'Lavoratore Autonomo', 'Pensionato', 'Casalinga', 'Studente', 'Disoccupato', 'Occupazione Saltuaria'];
const SETTORI = ['Industria', 'Commercio', 'Credito / Assicurazioni', 'Edilizia', 'Agricoltura', 'Stato', 'Trasporti', 'Servizi / Altro'];
const TIPO_ASSUNZIONE = ['Tempo Indeterminato', 'Tempo Determinato'];

const NEED_EMPLOYER = ['Dipendente', 'Lavoratore Autonomo'];
const NEED_SECTOR = ['Dipendente', 'Lavoratore Autonomo', 'Occupazione Saltuaria'];

export default function Step8Occupazione({ data, onChange, errors }) {
  const showSector = NEED_SECTOR.includes(data.attivita_lavorativa);
  const showAssunzione = data.attivita_lavorativa === 'Dipendente';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">La tua attività</h2>
        <p className="text-sm text-muted-foreground mt-1">Dicci cosa fai nella vita</p>
      </div>

      <FieldWrapper label="Attività lavorativa" required error={errors?.attivita_lavorativa} completed={!!data.attivita_lavorativa}>
        <div className="grid grid-cols-2 gap-2">
          {ATTIVITA.map(opt => (
            <button
              key={opt}
              onClick={() => onChange('attivita_lavorativa', opt)}
              className={`py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all text-left
                ${data.attivita_lavorativa === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {showSector && (
        <FieldWrapper label="Settore di attività" error={errors?.settore_attivita} completed={!!data.settore_attivita}>
          <Select value={data.settore_attivita || ''} onValueChange={v => onChange('settore_attivita', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona settore" />
            </SelectTrigger>
            <SelectContent>
              {SETTORI.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      )}

      {showSector && (
        <FieldWrapper label="Occupazione dal" error={errors?.occupazione_dal} completed={!!data.occupazione_dal}>
          <Input type="month" value={data.occupazione_dal || ''} onChange={e => onChange('occupazione_dal', e.target.value)} />
        </FieldWrapper>
      )}

      {showAssunzione && (
        <FieldWrapper label="Tipo assunzione" error={errors?.tipo_assunzione} completed={!!data.tipo_assunzione}>
          <div className="flex gap-2">
            {TIPO_ASSUNZIONE.map(opt => (
              <button
                key={opt}
                onClick={() => onChange('tipo_assunzione', opt)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-all
                  ${data.tipo_assunzione === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </FieldWrapper>
      )}
    </div>
  );
}
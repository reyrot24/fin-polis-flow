import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FieldWrapper from '../FieldWrapper';

const RAPPORTO_OPTIONS = ['Banca', 'Posta', 'Nessuno'];
const CARTA_OPTIONS = ['Visa', 'Mastercard', 'American Express', 'Bancomat', 'Nessuna Carta'];

export default function Step11SocioDemografico({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Nucleo familiare e rapporti bancari</h2>
        <p className="text-sm text-muted-foreground mt-1">Qualche informazione in più sulla tua situazione</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="Numero familiari" error={errors?.numero_familiari} completed={!!data.numero_familiari} hint="Incluso te stesso">
          <Input type="number" min={1} value={data.numero_familiari || ''} onChange={e => onChange('numero_familiari', parseInt(e.target.value) || '')} placeholder="Es. 3" />
        </FieldWrapper>

        <FieldWrapper label="Familiari con reddito" error={errors?.familiari_con_reddito} completed={!!data.familiari_con_reddito}>
          <Input type="number" min={0} value={data.familiari_con_reddito || ''} onChange={e => onChange('familiari_con_reddito', parseInt(e.target.value) || '')} placeholder="Es. 2" />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Rapporti banca / posta" error={errors?.rapporto_banca_posta} completed={!!data.rapporto_banca_posta}>
        <div className="flex gap-2">
          {RAPPORTO_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onChange('rapporto_banca_posta', opt)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all
                ${data.rapporto_banca_posta === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {data.rapporto_banca_posta && data.rapporto_banca_posta !== 'Nessuno' && (
        <FieldWrapper label="Cliente dal (mese/anno)" error={errors?.anzianita_banca} completed={!!data.anzianita_banca}>
          <Input type="month" value={data.anzianita_banca || ''} onChange={e => onChange('anzianita_banca', e.target.value)} />
        </FieldWrapper>
      )}

      <FieldWrapper label="Carta di credito" error={errors?.carta_credito} completed={!!data.carta_credito}>
        <Select value={data.carta_credito || ''} onValueChange={v => onChange('carta_credito', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona tipo carta" />
          </SelectTrigger>
          <SelectContent>
            {CARTA_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldWrapper>
    </div>
  );
}
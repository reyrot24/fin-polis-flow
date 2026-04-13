import { Input } from '@/components/ui/input';
import FieldWrapper from '../FieldWrapper';

export default function Step10Reddito({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Situazione economica</h2>
        <p className="text-sm text-muted-foreground mt-1">Inserisci i dati sul tuo reddito</p>
      </div>

      <FieldWrapper label="Tipo Reddito" required error={errors?.tipo_reddito} completed={!!data.tipo_reddito}>
        <div className="flex gap-2">
          {['Netto', 'Lordo'].map(opt => (
            <button
              key={opt}
              onClick={() => onChange('tipo_reddito', opt)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all
                ${data.tipo_reddito === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </FieldWrapper>

      <FieldWrapper label="Numero mensilità" error={errors?.numero_mensilita} completed={!!data.numero_mensilita} hint="Di solito 12, 13 o 14 mensilità">
        <Input type="number" min={1} max={18} value={data.numero_mensilita || ''} onChange={e => onChange('numero_mensilita', parseInt(e.target.value) || '')} placeholder="Es. 13" />
      </FieldWrapper>

      <FieldWrapper label="Reddito mensile" required error={errors?.reddito} completed={!!data.reddito} hint="Importo mensile in euro">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
          <Input type="number" className="pl-8" value={data.reddito || ''} onChange={e => onChange('reddito', parseFloat(e.target.value) || '')} placeholder="0,00" />
        </div>
      </FieldWrapper>
    </div>
  );
}
import { Input } from '@/components/ui/input';
import FieldWrapper from '../FieldWrapper';

export default function Step7Cittadinanza({ data, onChange, errors }) {
  const isExtraUE = data.cittadinanza === 'Altra' && data.cittadinanza_altra;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Cittadinanza</h2>
        <p className="text-sm text-muted-foreground mt-1">Indica la tua nazionalità</p>
      </div>

      <FieldWrapper label="Cittadinanza" required error={errors?.cittadinanza} completed={!!data.cittadinanza}>
        <div className="flex gap-2">
          {['Italiana', 'Altra'].map(opt => (
            <button
              key={opt}
              onClick={() => onChange('cittadinanza', opt)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all
                ${data.cittadinanza === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {opt === 'Altra' ? 'Altra cittadinanza' : opt}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {data.cittadinanza === 'Altra' && (
        <div className="space-y-4">
          <FieldWrapper label="Specifica la cittadinanza" required error={errors?.cittadinanza_altra} completed={!!data.cittadinanza_altra}>
            <Input value={data.cittadinanza_altra || ''} onChange={e => onChange('cittadinanza_altra', e.target.value)} placeholder="Es. Albanese, Rumena, Cinese..." />
          </FieldWrapper>

          <div className="p-4 bg-muted/50 rounded-xl space-y-4">
            <p className="text-sm font-medium text-foreground">Per cittadini extra-UE</p>
            <p className="text-xs text-muted-foreground">Se non sei cittadino UE, compila i seguenti campi</p>

            <FieldWrapper label="Scadenza permesso di soggiorno" error={errors?.scadenza_permesso_soggiorno} completed={!!data.scadenza_permesso_soggiorno}>
              <Input type="date" value={data.scadenza_permesso_soggiorno || ''} onChange={e => onChange('scadenza_permesso_soggiorno', e.target.value)} />
            </FieldWrapper>

            <FieldWrapper label="In Italia dal (mese/anno)" error={errors?.soggiorno_dal} completed={!!data.soggiorno_dal} hint="Mese e anno di arrivo in Italia">
              <Input type="month" value={data.soggiorno_dal || ''} onChange={e => onChange('soggiorno_dal', e.target.value)} />
            </FieldWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
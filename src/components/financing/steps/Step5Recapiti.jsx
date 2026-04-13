import { Input } from '@/components/ui/input';
import FieldWrapper from '../FieldWrapper';

export default function Step5Recapiti({ data, onChange, errors, metadata }) {
  const meta = (f) => metadata?.[f] || {};

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Come contattarti</h2>
        <p className="text-sm text-muted-foreground mt-1">Inserisci i tuoi recapiti principali</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FieldWrapper label="Cellulare" required error={errors?.cellulare} completed={!!data.cellulare} locked={meta('cellulare').editable === false} source={meta('cellulare').source} hint="Recapito prioritario per comunicazioni">
          <Input type="tel" value={data.cellulare || ''} onChange={e => onChange('cellulare', e.target.value)} placeholder="+39 3XX XXX XXXX" />
        </FieldWrapper>

        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl">
          <span className="text-amber-500 text-lg leading-none mt-0.5">⚠️</span>
          <p className="text-sm text-amber-900 leading-relaxed">
            <span className="font-semibold">Attenzione:</span> non inserire il cellulare di un'altra persona. Inserire sempre lo stesso numero di cellulare già comunicato a Compass in eventuali altri finanziamenti. Questa informazione è molto importante e può pregiudicare l'accettazione della pratica.
          </p>
        </div>

        <FieldWrapper label="Indirizzo Email" required error={errors?.email} completed={!!data.email} locked={meta('email').editable === false} source={meta('email').source}>
          <Input type="email" value={data.email || ''} onChange={e => onChange('email', e.target.value)} placeholder="la.tua@email.it" />
        </FieldWrapper>

        <FieldWrapper label="Telefono Fisso" error={errors?.telefono_fisso} completed={!!data.telefono_fisso}>
          <Input type="tel" value={data.telefono_fisso || ''} onChange={e => onChange('telefono_fisso', e.target.value)} placeholder="Opzionale" />
        </FieldWrapper>

        <FieldWrapper label="Altro Recapito" error={errors?.altro_recapito} completed={!!data.altro_recapito}>
          <Input type="tel" value={data.altro_recapito || ''} onChange={e => onChange('altro_recapito', e.target.value)} placeholder="Opzionale" />
        </FieldWrapper>
      </div>
    </div>
  );
}
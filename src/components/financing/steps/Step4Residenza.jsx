import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FieldWrapper from '../FieldWrapper';
import AddressFields from '../AddressFields';

const TIPO_ABITAZIONE = ['Proprietà', 'Proprietà con Mutuo', 'Affitto', 'Presso Parenti', 'Presso Terzi'];

export default function Step4Residenza({ data, onChange, errors, metadata }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Dove vivi</h2>
        <p className="text-sm text-muted-foreground mt-1">Inserisci il tuo indirizzo di residenza</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Residenza</h3>
        <AddressFields prefix="residenza" data={data} onChange={onChange} errors={errors} metadata={metadata} required />

        <FieldWrapper label="Tipo di abitazione" error={errors?.tipo_abitazione} completed={!!data.tipo_abitazione}>
          <Select value={data.tipo_abitazione || ''} onValueChange={v => onChange('tipo_abitazione', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo abitazione" />
            </SelectTrigger>
            <SelectContent>
              {TIPO_ABITAZIONE.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      <div className="border-t border-border pt-5">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
          <Switch checked={data.cambio_residenza_recente || false} onCheckedChange={v => onChange('cambio_residenza_recente', v)} id="cambio-res" />
          <Label htmlFor="cambio-res" className="text-sm cursor-pointer">
            Hai cambiato residenza negli ultimi 3 anni?
          </Label>
        </div>
        {data.cambio_residenza_recente && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Indirizzo precedente</h3>
            <AddressFields prefix="prev" data={data} onChange={onChange} errors={errors} metadata={metadata} />
          </div>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
          <Switch checked={data.domicilio_diverso || false} onCheckedChange={v => onChange('domicilio_diverso', v)} id="domicilio-switch" />
          <Label htmlFor="domicilio-switch" className="text-sm cursor-pointer">
            Il domicilio è diverso dalla residenza?
          </Label>
        </div>
        {data.domicilio_diverso && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Domicilio</h3>
            <AddressFields prefix="domicilio" data={data} onChange={onChange} errors={errors} metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  );
}
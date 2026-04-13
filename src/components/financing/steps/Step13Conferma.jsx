import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import FieldWrapper from '../FieldWrapper';

export default function Step13Conferma({ data, onChange, errors, missingCount }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Conferma e invio</h2>
        <p className="text-sm text-muted-foreground mt-1">Controlla con attenzione prima di inviare</p>
      </div>

      {missingCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/30">
          <AlertCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Attenzione</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ci sono ancora {missingCount} {missingCount === 1 ? 'campo obbligatorio' : 'campi obbligatori'} da compilare. Puoi salvare come bozza e completare in seguito.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 p-5 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Privacy e consensi</p>
            <p className="text-xs text-muted-foreground">Obbligatori per procedere</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy"
              checked={data.consenso_privacy || false}
              onCheckedChange={v => onChange('consenso_privacy', v)}
              className="mt-0.5"
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
              Dichiaro di aver preso visione dell'informativa sulla privacy e di acconsentire al trattamento dei miei dati personali
              {errors?.consenso_privacy && <span className="text-destructive text-xs ml-1">*</span>}
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="veridicita"
              checked={data.consenso_veridicita || false}
              onCheckedChange={v => onChange('consenso_veridicita', v)}
              className="mt-0.5"
            />
            <Label htmlFor="veridicita" className="text-sm leading-relaxed cursor-pointer">
              Confermo che tutti i dati forniti sono veritieri e corrispondono alla mia situazione attuale
              {errors?.consenso_veridicita && <span className="text-destructive text-xs ml-1">*</span>}
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="trattamento"
              checked={data.consenso_trattamento || false}
              onCheckedChange={v => onChange('consenso_trattamento', v)}
              className="mt-0.5"
            />
            <Label htmlFor="trattamento" className="text-sm leading-relaxed cursor-pointer">
              Autorizzo il trattamento dei dati per le finalità connesse alla presente richiesta di finanziamento
              {errors?.consenso_trattamento && <span className="text-destructive text-xs ml-1">*</span>}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
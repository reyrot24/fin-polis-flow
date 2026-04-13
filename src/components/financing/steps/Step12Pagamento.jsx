import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FieldWrapper from '../FieldWrapper';
import { AlertTriangle } from 'lucide-react';

export default function Step12Pagamento({ data, onChange, errors }) {
  const showIBAN = data.modalita_pagamento === 'SDD (Addebito su Conto Corrente)';
  const coobbligatoWarning = data.intestatario_conto === 'Coobbligato' && !data.ha_coobbligato;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Modalità di pagamento</h2>
        <p className="text-sm text-muted-foreground mt-1">Come vuoi effettuare i pagamenti?</p>
      </div>

      <FieldWrapper label="Modalità" required error={errors?.modalita_pagamento} completed={!!data.modalita_pagamento}>
        <div className="flex flex-col gap-2">
          {['SDD (Addebito su Conto Corrente)', 'Bollettino Postale'].map(opt => (
            <button
              key={opt}
              onClick={() => onChange('modalita_pagamento', opt)}
              className={`py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all text-left
                ${data.modalita_pagamento === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {showIBAN && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
          <FieldWrapper label="Codice IBAN" required error={errors?.codice_iban} completed={!!data.codice_iban} hint="IBAN italiano: IT seguito da 25 caratteri">
            <Input value={data.codice_iban || ''} onChange={e => onChange('codice_iban', e.target.value.toUpperCase())} placeholder="IT60 X054 2811 1010 0000 0123 456" className="uppercase tracking-wider font-mono" maxLength={34} />
          </FieldWrapper>

          <FieldWrapper label="Intestatario conto corrente" error={errors?.intestatario_conto} completed={!!data.intestatario_conto}>
            <Select value={data.intestatario_conto || ''} onValueChange={v => onChange('intestatario_conto', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona intestatario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Richiedente">Richiedente</SelectItem>
                <SelectItem value="Coobbligato">Coobbligato</SelectItem>
              </SelectContent>
            </Select>
          </FieldWrapper>

          {coobbligatoWarning && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/30">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-foreground">
                Hai selezionato "Coobbligato" come intestatario, ma non è presente un coobbligato nella pratica. Torna allo Step 2 per aggiungerne uno.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
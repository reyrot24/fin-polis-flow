import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FieldWrapper from '../FieldWrapper';
import { Users, User } from 'lucide-react';

const PARENTELA_OPTIONS = ['Coniuge', 'Convivente', 'Altra Parentela', 'Genitore', 'Figlio/a', 'Nessuna Parentela'];

export default function Step2Soggetto({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Tipo soggetto</h2>
        <p className="text-sm text-muted-foreground mt-1">Indica chi sta compilando la richiesta</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onChange('tipo_soggetto', 'richiedente')}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
            ${data.tipo_soggetto === 'richiedente' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.tipo_soggetto === 'richiedente' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Richiedente</p>
            <p className="text-xs text-muted-foreground">Intestatario della polizza</p>
          </div>
        </button>

        <button
          onClick={() => onChange('tipo_soggetto', 'coobbligato')}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
            ${data.tipo_soggetto === 'coobbligato' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.tipo_soggetto === 'coobbligato' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Coobbligato</p>
            <p className="text-xs text-muted-foreground">Garante o co-firmatario</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
        <Switch checked={data.ha_coobbligato || false} onCheckedChange={v => onChange('ha_coobbligato', v)} id="coobbligato-switch" />
        <Label htmlFor="coobbligato-switch" className="text-sm cursor-pointer">
          La pratica prevede un coobbligato?
        </Label>
      </div>

      {data.ha_coobbligato && (
        <FieldWrapper label="Grado di parentela con il richiedente" required error={errors?.grado_parentela} completed={!!data.grado_parentela}>
          <Select value={data.grado_parentela || ''} onValueChange={v => onChange('grado_parentela', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona il grado di parentela" />
            </SelectTrigger>
            <SelectContent>
              {PARENTELA_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      )}
    </div>
  );
}
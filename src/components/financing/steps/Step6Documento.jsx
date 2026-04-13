import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FieldWrapper from '../FieldWrapper';
import FileUpload from '../FileUpload';
import ResidenzaDocumentUpload from '../ResidenzaDocumentUpload';

const TIPI_DOCUMENTO = ["Carta d'Identità", 'Patente', 'Passaporto', 'Tessera Ministeriale'];
const ENTI_RILASCIO = ['Comune', 'Prefettura / Motorizzazione', 'Questura', 'Ministero'];

export default function Step6Documento({ data, onChange, errors, metadata }) {
  const meta = (f) => metadata?.[f] || {};

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Documento d'identità</h2>
        <p className="text-sm text-muted-foreground mt-1">Inserisci i dati del tuo documento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="Tipo Documento" required error={errors?.tipo_documento} completed={!!data.tipo_documento}>
          <Select value={data.tipo_documento || ''} onValueChange={v => onChange('tipo_documento', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPI_DOCUMENTO.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="Numero Documento" required error={errors?.numero_documento} completed={!!data.numero_documento} locked={meta('numero_documento').editable === false} source={meta('numero_documento').source}>
          <Input value={data.numero_documento || ''} onChange={e => onChange('numero_documento', e.target.value)} placeholder="N° documento" />
        </FieldWrapper>

        <FieldWrapper label="Data Rilascio" required error={errors?.data_rilascio} completed={!!data.data_rilascio}>
          <Input type="date" value={data.data_rilascio || ''} onChange={e => onChange('data_rilascio', e.target.value)} />
        </FieldWrapper>

        <FieldWrapper label="Località Rilascio" error={errors?.localita_rilascio} completed={!!data.localita_rilascio}>
          <Input value={data.localita_rilascio || ''} onChange={e => onChange('localita_rilascio', e.target.value)} placeholder="Comune di rilascio" />
        </FieldWrapper>

        <div className="sm:col-span-2">
          <FieldWrapper label="Ente Rilascio" required error={errors?.ente_rilascio} completed={!!data.ente_rilascio}>
            <Select value={data.ente_rilascio || ''} onValueChange={v => onChange('ente_rilascio', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona ente" />
              </SelectTrigger>
              <SelectContent>
                {ENTI_RILASCIO.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>
        </div>
      </div>

      {data.tipo_documento === "Carta d'Identità" && (
        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-blue-500 text-lg leading-none mt-0.5">ℹ️</span>
          <p className="text-sm text-blue-900 leading-relaxed">
            Se il documento d'identità è la <span className="font-semibold">Carta d'Identità Elettronica</span> (tesserina plastificata), non è necessario allegare la tessera sanitaria.
          </p>
        </div>
      )}

      <div className="border-t border-border pt-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Scansione documento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileUpload label="Fronte" value={data.documento_fronte_url} onChange={v => onChange('documento_fronte_url', v)} />
          <FileUpload label="Retro" value={data.documento_retro_url} onChange={v => onChange('documento_retro_url', v)} />
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mt-2">
          <Switch
            checked={data.residenza_non_aggiornata || false}
            onCheckedChange={v => onChange('residenza_non_aggiornata', v)}
            id="res-non-aggiornata"
          />
          <Label htmlFor="res-non-aggiornata" className="text-sm cursor-pointer">
            La residenza sul documento non è aggiornata o non coincide con quella dichiarata
          </Label>
        </div>

        {data.residenza_non_aggiornata && (
          <div className="space-y-3">
            <div className="flex gap-3 p-4 bg-orange-50 border border-orange-300 rounded-xl">
              <span className="text-orange-500 text-lg leading-none mt-0.5">⚠️</span>
              <div className="text-sm text-orange-900 space-y-2">
                <p className="font-semibold">La residenza sul documento non risulta aggiornata.</p>
                <p>In questo caso è necessario caricare un documento che provi il nuovo indirizzo di residenza. <span className="font-semibold">L'autocertificazione NON è valida.</span></p>
                <p className="font-medium mt-1">Puoi inviare uno dei seguenti documenti:</p>
                <ol className="list-decimal list-inside space-y-1 text-orange-800">
                  <li>Libretto veicolo da cui si evince la residenza</li>
                  <li>Busta paga con indirizzo cliente / cedolino pensione / OBIS M</li>
                  <li>Certificato di residenza o stato civile con indirizzo di residenza, non più vecchio di 90 giorni (gratuito tramite SPID)</li>
                  <li>Tessera elettorale</li>
                  <li>Bolletta utenza domestica (acqua, luce, gas), non più vecchia di 90 giorni, intestata al cliente</li>
                </ol>
              </div>
            </div>
            <ResidenzaDocumentUpload data={data} onChange={onChange} />

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
              <input
                type="checkbox"
                id="presa-visione-residenza"
                checked={data.presa_visione_residenza || false}
                onChange={e => onChange('presa_visione_residenza', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
              />
              <Label htmlFor="presa-visione-residenza" className="text-sm cursor-pointer text-foreground">
                Ho preso visione delle istruzioni e provvederò a caricare un documento valido che attesti la residenza aggiornata.
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
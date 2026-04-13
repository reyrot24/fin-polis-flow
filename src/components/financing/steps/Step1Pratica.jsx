import { Input } from '@/components/ui/input';
import FieldWrapper from '../FieldWrapper';

export default function Step1Pratica({ data, onChange, errors, metadata }) {
  const meta = (f) => metadata?.[f] || {};
  const err = (f) => errors?.[f];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Dati della pratica</h2>
        <p className="text-sm text-muted-foreground mt-1">Verifica i riferimenti della tua polizza</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="ID Pratica" required error={err('pratica_id')} completed={!!data.pratica_id} locked={meta('pratica_id').editable === false} source={meta('pratica_id').source}>
          <Input value={data.pratica_id || ''} onChange={e => onChange('pratica_id', e.target.value)} placeholder="ID pratica" />
        </FieldWrapper>

        <FieldWrapper label="Numero Preventivo" error={err('numero_preventivo')} completed={!!data.numero_preventivo} locked={meta('numero_preventivo').editable === false} source={meta('numero_preventivo').source}>
          <Input value={data.numero_preventivo || ''} onChange={e => onChange('numero_preventivo', e.target.value)} placeholder="N° preventivo" />
        </FieldWrapper>

        <FieldWrapper label="Numero Polizza" error={err('numero_polizza')} completed={!!data.numero_polizza} locked={meta('numero_polizza').editable === false} source={meta('numero_polizza').source}>
          <Input value={data.numero_polizza || ''} onChange={e => onChange('numero_polizza', e.target.value)} placeholder="N° polizza o riferimento" />
        </FieldWrapper>

        <FieldWrapper label="Intermediario / Subagente" error={err('intermediario')} completed={!!data.intermediario} locked={meta('intermediario').editable === false} source={meta('intermediario').source}>
          <Input value={data.intermediario || ''} onChange={e => onChange('intermediario', e.target.value)} placeholder="Nome intermediario" />
        </FieldWrapper>

        <FieldWrapper label="Prodotto / Compagnia" error={err('prodotto_compagnia')} completed={!!data.prodotto_compagnia} locked={meta('prodotto_compagnia').editable === false} source={meta('prodotto_compagnia').source}>
          <Input value={data.prodotto_compagnia || ''} onChange={e => onChange('prodotto_compagnia', e.target.value)} placeholder="Nome prodotto" />
        </FieldWrapper>

        <FieldWrapper label="Importo da Finanziare" error={err('importo_finanziare')} completed={!!data.importo_finanziare} locked={meta('importo_finanziare').editable === false} source={meta('importo_finanziare').source} hint="Importo totale del finanziamento richiesto">
          <Input type="number" value={data.importo_finanziare || ''} onChange={e => onChange('importo_finanziare', parseFloat(e.target.value) || '')} placeholder="€ 0,00" />
        </FieldWrapper>

        <FieldWrapper label="Premio Polizza" error={err('premio_polizza')} completed={!!data.premio_polizza} locked={meta('premio_polizza').editable === false} source={meta('premio_polizza').source}>
          <Input type="number" value={data.premio_polizza || ''} onChange={e => onChange('premio_polizza', parseFloat(e.target.value) || '')} placeholder="€ 0,00" />
        </FieldWrapper>

        <FieldWrapper label="Data Apertura Richiesta" error={err('data_apertura')} completed={!!data.data_apertura} locked={meta('data_apertura').editable === false} source={meta('data_apertura').source}>
          <Input type="date" value={data.data_apertura || ''} onChange={e => onChange('data_apertura', e.target.value)} />
        </FieldWrapper>
      </div>
    </div>
  );
}
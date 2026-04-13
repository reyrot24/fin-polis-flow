import { Input } from '@/components/ui/input';
import FieldWrapper from '../FieldWrapper';
import AddressFields from '../AddressFields';

const NEED_EMPLOYER = ['Dipendente', 'Lavoratore Autonomo'];

export default function Step9Datore({ data, onChange, errors, metadata }) {
  const isRelevant = NEED_EMPLOYER.includes(data.attivita_lavorativa);
  const label = data.attivita_lavorativa === 'Lavoratore Autonomo' ? 'Attività / Sede professionale' : 'Datore di lavoro';

  if (!isRelevant) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{label}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            In base alla tua occupazione ({data.attivita_lavorativa || 'non specificata'}), questa sezione non è necessaria.
          </p>
        </div>
        <div className="p-6 bg-muted/50 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">Puoi procedere al prossimo step</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{label}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data.attivita_lavorativa === 'Lavoratore Autonomo'
            ? 'Inserisci i dati della tua attività'
            : 'Inserisci i dati del tuo datore di lavoro'
          }
        </p>
      </div>

      <FieldWrapper label="Ragione Sociale" error={errors?.datore_ragione_sociale} completed={!!data.datore_ragione_sociale}>
        <Input value={data.datore_ragione_sociale || ''} onChange={e => onChange('datore_ragione_sociale', e.target.value)} placeholder="Nome azienda o attività" />
      </FieldWrapper>

      <AddressFields prefix="datore" data={data} onChange={onChange} errors={errors} metadata={metadata} />

      <FieldWrapper label="Telefono" error={errors?.datore_telefono} completed={!!data.datore_telefono}>
        <Input type="tel" value={data.datore_telefono || ''} onChange={e => onChange('datore_telefono', e.target.value)} placeholder="Recapito telefonico" />
      </FieldWrapper>
    </div>
  );
}
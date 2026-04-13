import { Input } from '@/components/ui/input';
import FieldWrapper from './FieldWrapper';
import { validateCAP, validateProvincia } from '@/lib/validators';

export default function AddressFields({ prefix, data, onChange, errors, metadata, required }) {
  const val = (field) => data[`${prefix}_${field}`] || '';
  const meta = (field) => metadata?.[`${prefix}_${field}`] || {};
  const err = (field) => errors?.[`${prefix}_${field}`];

  const handleChange = (field, value) => {
    onChange(`${prefix}_${field}`, value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <FieldWrapper label="Indirizzo" required={required} error={err('indirizzo')} completed={!!val('indirizzo')} locked={meta('indirizzo').editable === false} source={meta('indirizzo').source}>
          <Input placeholder="Via, piazza, corso..." value={val('indirizzo')} onChange={e => handleChange('indirizzo', e.target.value)} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="N. Civico" required={required} error={err('civico')} completed={!!val('civico')} locked={meta('civico').editable === false}>
        <Input placeholder="N°" value={val('civico')} onChange={e => handleChange('civico', e.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="CAP" required={required} error={err('cap')} completed={!!val('cap')} locked={meta('cap').editable === false} hint="Inserisci le 5 cifre del codice postale">
        <Input placeholder="00000" maxLength={5} value={val('cap')} onChange={e => handleChange('cap', e.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Località" required={required} error={err('localita')} completed={!!val('localita')} locked={meta('localita').editable === false}>
        <Input placeholder="Comune" value={val('localita')} onChange={e => handleChange('localita', e.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Provincia" required={required} error={err('provincia')} completed={!!val('provincia')} locked={meta('provincia').editable === false} hint="Sigla a due lettere (es. MI, RM)">
        <Input placeholder="XX" maxLength={2} className="uppercase" value={val('provincia')} onChange={e => handleChange('provincia', e.target.value.toUpperCase())} />
      </FieldWrapper>
    </div>
  );
}
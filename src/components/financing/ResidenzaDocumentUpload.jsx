import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, Edit2, Check } from 'lucide-react';

export default function ResidenzaDocumentUpload({ data, onChange }) {
  const [phase, setPhase] = useState('idle'); // idle | uploading | analyzing | review | done | error
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setPhase('uploading');
    setErrorMsg('');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
    setPhase('analyzing');

    const res = await base44.functions.invoke('extractDocumentData', { file_front_url: file_url });
    const result = res.data;

    if (result.success && result.data) {
      const d = result.data;
      // Build address string from extracted fields
      const parts = [
        d.residenza_indirizzo || d.indirizzo,
        d.residenza_civico || d.civico,
        d.residenza_cap || d.cap,
        d.residenza_localita || d.localita || d.citta,
        d.residenza_provincia || d.provincia,
      ].filter(Boolean);
      const addr = parts.join(', ');
      setExtracted({ ...d, _addressString: addr || '' });
      setEditAddress(addr || '');
      setPhase('review');
    } else {
      // fallback: let user type manually
      setExtracted({ _addressString: '' });
      setEditAddress('');
      setPhase('review');
    }
  }

  function handleConfirm() {
    // Parse address back into fields if possible
    if (extracted) {
      if (extracted.residenza_indirizzo) onChange('residenza_indirizzo', extracted.residenza_indirizzo);
      if (extracted.residenza_civico) onChange('residenza_civico', extracted.residenza_civico);
      if (extracted.residenza_cap) onChange('residenza_cap', extracted.residenza_cap);
      if (extracted.residenza_localita) onChange('residenza_localita', extracted.residenza_localita);
      if (extracted.residenza_provincia) onChange('residenza_provincia', extracted.residenza_provincia);
      // If no structured fields, at least store the full string in indirizzo
      if (!extracted.residenza_indirizzo && editAddress) {
        onChange('residenza_indirizzo', editAddress);
      }
      if (extracted.nome) onChange('nome', extracted.nome);
      if (extracted.cognome) onChange('cognome', extracted.cognome);
    }
    onChange('documento_residenza_url', uploadedUrl);
    setPhase('done');
  }

  function handleReset() {
    setPhase('idle');
    setUploadedUrl(null);
    setExtracted(null);
    setEditAddress('');
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Carica documento che attesta la residenza</p>

      {phase === 'idle' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); }}
          >
            <Upload className="w-4 h-4" />
            Carica da file
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => { fileInputRef.current.setAttribute('capture', 'environment'); fileInputRef.current.click(); }}
          >
            <Camera className="w-4 h-4" />
            Scatta foto
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {(phase === 'uploading' || phase === 'analyzing') && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
          <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            {phase === 'uploading' ? 'Caricamento in corso…' : 'Analisi documento in corso…'}
          </p>
        </div>
      )}

      {phase === 'review' && (
        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Edit2 className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">
              {extracted?._addressString ? 'Indirizzo rilevato — verifica e conferma' : 'Indirizzo non rilevato — inserisci manualmente'}
            </p>
          </div>

          {extracted && (
            <div className="space-y-2 text-xs text-blue-800">
              {extracted.nome && <p>Nome: <span className="font-medium">{extracted.nome} {extracted.cognome}</span></p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-blue-900">Indirizzo di residenza</label>
            <Input
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
              placeholder="Es. Via Roma 1, 20100 Milano MI"
              className="bg-white border-blue-300 text-sm"
            />
            <p className="text-[10px] text-blue-700">Puoi modificare il testo prima di confermare</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" onClick={handleConfirm} className="gap-1.5 flex-1">
              <Check className="w-3.5 h-3.5" />
              Conferma e aggiorna
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleReset} className="text-xs">
              Riprova
            </Button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Indirizzo aggiornato automaticamente dal documento</p>
            <p className="text-xs text-green-700 mt-0.5">{editAddress}</p>
          </div>
          <button onClick={handleReset} className="text-xs text-green-600 underline">Modifica</button>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">{errorMsg}</p>
          <button onClick={handleReset} className="text-xs text-red-600 underline ml-auto">Riprova</button>
        </div>
      )}
    </div>
  );
}
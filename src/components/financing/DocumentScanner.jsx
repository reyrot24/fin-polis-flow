import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Upload, FileText, ArrowRight, X, RefreshCw, Loader2, Image, CheckCircle2, AlertTriangle } from 'lucide-react';

function QualityHints() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
      <p className="text-xs font-semibold text-amber-800">📸 Consigli per una buona foto</p>
      <ul className="text-xs text-amber-700 space-y-0.5">
        <li>• Assicurati che il documento sia ben visibile</li>
        <li>• Evita riflessi e immagini sfocate</li>
        <li>• Fotografa il documento per intero</li>
        <li>• Usa buona illuminazione</li>
      </ul>
    </div>
  );
}

function ImagePreview({ label, url, onRemove }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
      <img src={url} alt={label} className="w-full h-32 object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 flex items-center justify-between">
        <span className="text-[10px] text-white font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-400" />{label}
        </span>
        <button onClick={onRemove} className="text-white hover:text-red-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DocumentScanner({ onExtracted, onSkip }) {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const dropRef = useRef(null);

  async function uploadFile(file) {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  }

  async function handleFiles(files, side) {
    const file = files[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const url = await uploadFile(file);
    if (side === 'front') {
      setFrontFile(file);
      setFrontUrl(url);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackFile(file);
      setBackUrl(url);
      setBackPreview(URL.createObjectURL(file));
    }
    setUploading(false);
  }

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  async function handleFileInput(e, side) {
    await handleFiles(e.target.files, side);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    if (files.length > 0) handleFiles([files[0]], 'front');
    if (files.length > 1) handleFiles([files[1]], 'back');
  }

  async function handleAnalyze() {
    if (!frontUrl) return;
    setAnalyzing(true);
    setError(null);
    const res = await base44.functions.invoke('extractDocumentData', {
      file_front_url: frontUrl,
      file_back_url: backUrl || undefined,
    });
    setAnalyzing(false);
    const data = res.data;
    if (!data.success || data.fallback) {
      setError(data.error || 'Estrazione fallita. Puoi compilare manualmente.');
      return;
    }
    onExtracted({
      extracted: data.extracted,
      formFields: data.form_fields,
      frontUrl,
      backUrl,
      extractedAt: data.extracted_at,
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Image className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Scansiona il tuo documento</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Carica o fotografa il documento di identità. Compileremo automaticamente i dati principali.
        </p>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
        }`}
      >
        {!frontPreview ? (
          <div className="space-y-3">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">Trascina qui il documento oppure</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => frontInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Fronte documento
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => backInputRef.current?.click()}
                disabled={uploading || !frontPreview}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Retro documento
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP, PDF</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ImagePreview label="Fronte" url={frontPreview} onRemove={() => { setFrontFile(null); setFrontUrl(null); setFrontPreview(null); }} />
              {backPreview ? (
                <ImagePreview label="Retro" url={backPreview} onRemove={() => { setBackFile(null); setBackUrl(null); setBackPreview(null); }} />
              ) : (
                <button
                  onClick={() => backInputRef.current?.click()}
                  disabled={uploading}
                  className="border-2 border-dashed border-border rounded-xl h-32 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">+ Retro (opzionale)</span>
                </button>
              )}
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Caricamento in corso...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={frontInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={e => handleFileInput(e, 'front')}
      />
      <input
        ref={backInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={e => handleFileInput(e, 'back')}
      />

      <QualityHints />

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          🔒 Il documento viene elaborato esclusivamente per estrarre i dati necessari alla richiesta di finanziamento. Potrai verificare e correggere tutte le informazioni prima dell'invio.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-destructive">Lettura non riuscita</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleAnalyze}
          disabled={!frontUrl || uploading || analyzing}
          className="w-full gap-2"
          size="lg"
        >
          {analyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analisi in corso con AI...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Analizza documento</>
          )}
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full text-muted-foreground text-sm gap-2">
          <ArrowRight className="w-4 h-4" />
          Continua manualmente senza scansione
        </Button>
      </div>
    </div>
  );
}
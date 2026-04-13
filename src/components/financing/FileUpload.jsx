import { useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function FileUpload({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Formato non supportato. Usa JPG, PNG, WebP o PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Il file è troppo grande. Dimensione massima: 10 MB.');
      return;
    }

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPreview(file_url);
    onChange(file_url);
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {preview ? (
        <div className="relative border border-border rounded-lg p-3 bg-muted/50">
          <div className="flex items-center gap-3">
            {preview.match(/\.(jpg|jpeg|png|webp)/i) ? (
              <img src={preview} alt={label} className="w-16 h-16 object-cover rounded-md" />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">Documento caricato</p>
              <p className="text-xs text-muted-foreground">Clicca × per rimuovere</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemove} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clicca per caricare</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP o PDF · Max 10 MB</span>
            </>
          )}
          <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
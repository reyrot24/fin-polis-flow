import { CheckCircle2, AlertCircle, Lock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function FieldWrapper({ label, required, error, completed, locked, hint, source, children }) {
  const getStatusIcon = () => {
    if (locked) return <Lock className="w-3.5 h-3.5 text-muted-foreground" />;
    if (error) return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
    if (completed) return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    return null;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {getStatusIcon()}
        {source === 'piattaforma' && (
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
            Auto
          </span>
        )}
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={locked ? 'opacity-70 pointer-events-none' : ''}>
        {children}
      </div>
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
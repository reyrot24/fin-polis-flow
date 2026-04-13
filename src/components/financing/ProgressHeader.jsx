import { Progress } from '@/components/ui/progress';
import { ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProgressHeader({ percentage, missingCount, onGoToMissing, lastSaved }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-foreground">Completamento richiesta</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {missingCount > 0
              ? `Mancano ancora ${missingCount} ${missingCount === 1 ? 'dato' : 'dati'}`
              : 'Tutti i dati sono stati inseriti!'
            }
          </p>
        </div>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2 mb-3" />
      <div className="flex items-center justify-between">
        {missingCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onGoToMissing} className="text-xs text-primary gap-1.5 px-2 h-7">
            <ArrowRight className="w-3 h-3" />
            Vai al prossimo campo
          </Button>
        )}
        {lastSaved && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
            <Save className="w-3 h-3" />
            Salvato {lastSaved}
          </div>
        )}
      </div>
    </div>
  );
}
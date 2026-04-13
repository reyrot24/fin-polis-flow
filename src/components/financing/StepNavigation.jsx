import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

export default function StepNavigation({ currentStep, totalSteps, onPrev, onNext, onSave, isLastStep, isSaving }) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button variant="outline" onClick={onPrev} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </Button>
        )}
        <Button variant="ghost" onClick={onSave} className="gap-1.5 text-muted-foreground" disabled={isSaving}>
          <Save className="w-4 h-4" />
          Salva bozza
        </Button>
      </div>
      <Button onClick={onNext} className="gap-1.5 min-w-[140px]" size="lg">
        {isLastStep ? (
          <>
            <Send className="w-4 h-4" />
            Conferma e invia
          </>
        ) : (
          <>
            Continua
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
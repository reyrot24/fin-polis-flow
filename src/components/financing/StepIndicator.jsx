import { STEPS } from '@/lib/stepConfig';
import { Check } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="mb-6">
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-2 min-w-max px-1">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps?.includes(step.id);

            return (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                  ${isActive ? 'bg-primary text-primary-foreground shadow-md' : ''}
                  ${isCompleted && !isActive ? 'bg-success/10 text-success' : ''}
                  ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, Clock, AlertTriangle, XCircle, ChevronRight, Lock } from 'lucide-react';
import { calculateCompletion, getMissingFields, STEPS } from '@/lib/stepConfig';
import ProgressHeader from '@/components/financing/ProgressHeader';
import StepIndicator from '@/components/financing/StepIndicator';
import StepNavigation from '@/components/financing/StepNavigation';
import Step1Pratica from '@/components/financing/steps/Step1Pratica';
import Step2Soggetto from '@/components/financing/steps/Step2Soggetto';
import Step3Anagrafica from '@/components/financing/steps/Step3Anagrafica';
import Step4Residenza from '@/components/financing/steps/Step4Residenza';
import Step5Recapiti from '@/components/financing/steps/Step5Recapiti';
import Step6Documento from '@/components/financing/steps/Step6Documento';
import Step7Cittadinanza from '@/components/financing/steps/Step7Cittadinanza';
import Step8Occupazione from '@/components/financing/steps/Step8Occupazione';
import Step9Datore from '@/components/financing/steps/Step9Datore';
import Step10Reddito from '@/components/financing/steps/Step10Reddito';
import Step11SocioDemografico from '@/components/financing/steps/Step11SocioDemografico';
import Step12Pagamento from '@/components/financing/steps/Step12Pagamento';
import Step13Conferma from '@/components/financing/steps/Step13Conferma';
import { motion } from 'framer-motion';
import moment from 'moment';

function getToken() {
  const path = window.location.pathname;
  const match = path.match(/\/intake\/([a-f0-9]{64})/);
  return match ? match[1] : null;
}

function WelcomeScreen({ data, missingCount, onStart }) {
  const name = data.nome || 'Cliente';
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-6 pt-12 pb-20 text-center text-primary-foreground">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Ciao {name}!</h1>
        <p className="text-primary-foreground/80 text-sm max-w-xs mx-auto">
          Completa la tua richiesta di finanziamento polizza in pochi minuti
        </p>
      </div>
      <div className="max-w-md mx-auto w-full px-6 -mt-10 flex-1">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Abbiamo già inserito parte dei tuoi dati</p>
              <p className="text-xs text-muted-foreground">Controlla e completa le informazioni mancanti</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: Clock, text: `Solo ${missingCount > 0 ? missingCount + ' campi mancanti' : 'la conferma finale'}`, sub: 'La procedura richiede pochi minuti' },
              { icon: Lock, text: 'Dati protetti', sub: 'Connessione sicura e cifrata' },
              { icon: CheckCircle2, text: 'Puoi riprendere in qualsiasi momento', sub: 'Il tuo progresso viene salvato automaticamente' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{text}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.importo_finanziare && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Importo da finanziare</p>
            <p className="text-2xl font-bold text-primary">€ {Number(data.importo_finanziare).toLocaleString('it-IT')}</p>
            {data.prodotto_compagnia && <p className="text-xs text-muted-foreground mt-1">{data.prodotto_compagnia}</p>}
          </div>
        )}

        <Button className="w-full h-12 text-base gap-2" onClick={onStart}>
          Inizia ora
          <ChevronRight className="w-5 h-5" />
        </Button>
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Per proseguire è necessario prendere visione dell'informativa privacy
        </p>
      </div>
    </motion.div>
  );
}

function ErrorScreen({ code, expiresAt }) {
  const messages = {
    revoked: { icon: XCircle, title: 'Link non più valido', body: 'Questo link è stato revocato. Contatta il tuo agente per riceverne uno nuovo.', color: 'text-destructive' },
    expired: { icon: Clock, title: 'Link scaduto', body: `Questo link era valido fino al ${expiresAt ? moment(expiresAt).format('DD/MM/YYYY') : ''}. Contatta il tuo agente per riceverne uno nuovo.`, color: 'text-warning' },
    notfound: { icon: AlertTriangle, title: 'Link non trovato', body: 'Il link inserito non è valido. Verifica di aver copiato correttamente l\'indirizzo.', color: 'text-muted-foreground' },
  };
  const cfg = messages[code] || messages.notfound;
  const Icon = cfg.icon;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-sm">
        <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-8 h-8 ${cfg.color}`} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">{cfg.title}</h2>
        <p className="text-sm text-muted-foreground">{cfg.body}</p>
      </div>
    </div>
  );
}

function SubmittedScreen({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Richiesta completata!</h2>
        <p className="text-sm text-muted-foreground mb-2">
          La tua richiesta di finanziamento è stata inviata con successo.
        </p>
        <p className="text-sm text-muted-foreground mb-6">Riceverai una conferma dal tuo agente assicurativo.</p>
        <div className="bg-muted/50 rounded-xl p-4 text-left">
          <p className="text-xs text-muted-foreground">Numero pratica</p>
          <p className="text-sm font-mono font-medium">{data?.pratica_id || '—'}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CustomerIntake() {
  const [phase, setPhase] = useState('loading'); // loading | error | welcome | wizard | submitted
  const [errorCode, setErrorCode] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [formData, setFormData] = useState({});
  const [metadata, setMetadata] = useState({});
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const token = getToken();

  useEffect(() => {
    async function init() {
      if (!token) { setErrorCode('notfound'); setPhase('error'); return; }
      const res = await base44.functions.invoke('validateCustomerLink', { token });
      const d = res.data;
      if (!d.success) { setErrorCode(d.code || 'notfound'); setPhase('error'); return; }
      setLinkData(d.link);
      if (d.link.status === 'submitted' || d.readonly) {
        setFormData(d.data || {});
        setPhase('submitted');
        return;
      }
      const record = d.data || {};
      setFormData(record);
      if (record.fields_metadata) setMetadata(record.fields_metadata);
      setCurrentStep(record.current_step || 1);
      setPhase('welcome');
    }
    init();
  }, [token]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const log = updated.log_modificati || [];
      if (!log.includes(field)) {
        updated.log_modificati = [...log, field];
      }
      // Mark as customer-entered
      updated.fields_metadata = { ...updated.fields_metadata, [field]: { ...(updated.fields_metadata?.[field] || {}), source: 'cliente', completed_by: 'cliente' } };
      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const saveDraft = useCallback(async (data) => {
    if (!token) return;
    setIsSaving(true);
    const toSave = {
      ...data,
      current_step: currentStep,
      completion_percentage: calculateCompletion(data),
      campi_mancanti: getMissingFields(data),
    };
    await base44.functions.invoke('submitCustomerIntake', { token, form_data: toSave, is_draft: true });
    setLastSaved(moment().format('HH:mm'));
    setIsSaving(false);
  }, [token, currentStep]);

  const handleNext = useCallback(async () => {
    if (currentStep === 13) {
      if (!formData.consenso_privacy || !formData.consenso_veridicita || !formData.consenso_trattamento) {
        setErrors({ consenso_privacy: 'Obbligatorio', consenso_veridicita: 'Obbligatorio', consenso_trattamento: 'Obbligatorio' });
        return;
      }
      const consentLog = {
        privacy: formData.consenso_privacy,
        veridicita: formData.consenso_veridicita,
        trattamento: formData.consenso_trattamento,
        timestamp: new Date().toISOString(),
        ua: navigator.userAgent,
      };
      const finalData = { ...formData, data_conferma: new Date().toISOString(), completion_percentage: 100, campi_mancanti: [] };
      await base44.functions.invoke('submitCustomerIntake', { token, form_data: finalData, consent_log: consentLog, is_draft: false });
      setPhase('submitted');
      return;
    }
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    await saveDraft(formData);
    setCurrentStep(prev => Math.min(prev + 1, 13));
    window.scrollTo(0, 0);
  }, [currentStep, formData, saveDraft, token]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }, []);

  const handleGoToMissing = useCallback(() => {
    const missing = getMissingFields(formData);
    if (!missing.length) return;
    for (const step of STEPS) {
      if (step.fields.includes(missing[0])) { setCurrentStep(step.id); break; }
    }
  }, [formData]);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (phase === 'error') return <ErrorScreen code={errorCode} expiresAt={linkData?.expires_at} />;
  if (phase === 'submitted') return <SubmittedScreen data={formData} />;
  if (phase === 'welcome') {
    return <WelcomeScreen data={formData} missingCount={getMissingFields(formData).length} onStart={() => setPhase('wizard')} />;
  }

  const percentage = calculateCompletion(formData);
  const missingCount = getMissingFields(formData).length;
  const stepProps = { data: formData, onChange: handleFieldChange, errors, metadata, missingCount };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Pratica {...stepProps} />;
      case 2: return <Step2Soggetto {...stepProps} />;
      case 3: return <Step3Anagrafica {...stepProps} />;
      case 4: return <Step4Residenza {...stepProps} />;
      case 5: return <Step5Recapiti {...stepProps} />;
      case 6: return <Step6Documento {...stepProps} />;
      case 7: return <Step7Cittadinanza {...stepProps} />;
      case 8: return <Step8Occupazione {...stepProps} />;
      case 9: return <Step9Datore {...stepProps} />;
      case 10: return <Step10Reddito {...stepProps} />;
      case 11: return <Step11SocioDemografico {...stepProps} />;
      case 12: return <Step12Pagamento {...stepProps} />;
      case 13: return <Step13Conferma {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-foreground">Completa la tua richiesta</h1>
            <p className="text-[10px] text-muted-foreground truncate">
              {formData.prodotto_compagnia || 'Finanziamento polizza'}
              {linkData?.expires_at && ` · Scade il ${moment(linkData.expires_at).format('DD/MM/YY')}`}
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-medium text-primary">{percentage}%</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <ProgressHeader percentage={percentage} missingCount={missingCount} onGoToMissing={handleGoToMissing} lastSaved={lastSaved} />
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
          {renderStep()}
          <StepNavigation
            currentStep={currentStep}
            totalSteps={13}
            onPrev={handlePrev}
            onNext={handleNext}
            onSave={() => saveDraft(formData)}
            isLastStep={currentStep === 13}
            isSaving={isSaving}
          />
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-6">
          I tuoi dati sono al sicuro e verranno trattati secondo la normativa vigente
        </p>
      </main>
    </div>
  );
}
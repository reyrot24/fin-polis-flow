import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { STEPS, calculateCompletion, getMissingFields, REQUIRED_FIELDS } from '@/lib/stepConfig';
import { validateCodiceFiscale, validateEmail, validateCellulare, validateCAP, validateProvincia, validateIBAN } from '@/lib/validators';
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
import { Shield } from 'lucide-react';
import WizardSharePanel from '@/components/financing/WizardSharePanel';
import DocumentScanner from '@/components/financing/DocumentScanner';
import ExtractionReview from '@/components/financing/ExtractionReview';
import moment from 'moment';

function parseInitialPayload() {
  const params = new URLSearchParams(window.location.search);
  const payload = {};
  const metadata = {};
  const logImportati = [];

  const fieldMap = {
    pratica_id: 'pratica_id', id_pratica: 'pratica_id',
    numero_preventivo: 'numero_preventivo', numero_polizza: 'numero_polizza',
    intermediario: 'intermediario', prodotto_compagnia: 'prodotto_compagnia',
    importo_finanziare: 'importo_finanziare', importo: 'importo_finanziare',
    premio_polizza: 'premio_polizza', premio: 'premio_polizza',
    cognome: 'cognome', nome: 'nome', codice_fiscale: 'codice_fiscale',
    data_nascita: 'data_nascita', cellulare: 'cellulare', email: 'email',
    indirizzo: 'residenza_indirizzo', cap: 'residenza_cap',
    localita: 'residenza_localita', provincia: 'residenza_provincia',
    iban: 'codice_iban',
  };

  const readOnlyFields = ['pratica_id', 'numero_preventivo', 'numero_polizza', 'intermediario', 'prodotto_compagnia'];

  for (const [key, value] of params.entries()) {
    const mappedField = fieldMap[key] || key;
    if (value) {
      payload[mappedField] = isNaN(value) ? value : parseFloat(value);
      metadata[mappedField] = {
        source: 'piattaforma',
        editable: !readOnlyFields.includes(mappedField),
      };
      logImportati.push(mappedField);
    }
  }

  return { payload, metadata, logImportati };
}

export default function FinancingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [metadata, setMetadata] = useState({});
  const [errors, setErrors] = useState({});
  const [recordId, setRecordId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanPhase, setScanPhase] = useState('scan'); // 'scan' | 'review' | 'form'
  const [extractionResult, setExtractionResult] = useState(null);

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const existingId = params.get('record_id');

      if (existingId) {
        const records = await base44.entities.FinancingRequest.filter({ id: existingId });
        if (records.length > 0) {
          const record = records[0];
          setFormData(record);
          setRecordId(record.id);
          setCurrentStep(record.current_step || 1);
          if (record.fields_metadata) setMetadata(record.fields_metadata);
          setScanPhase('form'); // skip scan for existing records
        }
      } else {
        const { payload, metadata: meta, logImportati } = parseInitialPayload();
        if (Object.keys(payload).length > 0) {
          payload.log_importati = logImportati;
          payload.data_apertura = payload.data_apertura || moment().format('YYYY-MM-DD');
          payload.stato_pratica = 'bozza';
          if (!payload.stato_civile) payload.stato_civile = 'Convivente';
          if (!payload.tipo_abitazione) payload.tipo_abitazione = 'Proprietà';
          if (!payload.tipo_reddito) payload.tipo_reddito = 'Netto';
          if (!payload.numero_mensilita) payload.numero_mensilita = 12;
          if (!payload.rapporto_banca_posta) payload.rapporto_banca_posta = 'Posta';
          if (!payload.anzianita_banca) payload.anzianita_banca = '2020-01';
          if (!payload.tipo_soggetto) payload.tipo_soggetto = 'richiedente';
          if (!payload.cittadinanza) payload.cittadinanza = 'Italiana';
          setFormData(payload);
          setMetadata(meta);
        } else {
          setFormData({ stato_pratica: 'bozza', data_apertura: moment().format('YYYY-MM-DD'), stato_civile: 'Convivente', tipo_abitazione: 'Proprietà', tipo_reddito: 'Netto', numero_mensilita: 12, rapporto_banca_posta: 'Posta', anzianita_banca: '2020-01', tipo_soggetto: 'richiedente', cittadinanza: 'Italiana' });
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (!prev.log_modificati) updated.log_modificati = [];
      if (!updated.log_modificati.includes(field)) {
        updated.log_modificati = [...updated.log_modificati, field];
      }
      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validateStep = useCallback((step) => {
    const newErrors = {};
    const d = formData;

    if (step === 3) {
      if (!d.cognome) newErrors.cognome = 'Obbligatorio';
      if (!d.nome) newErrors.nome = 'Obbligatorio';
      if (!d.data_nascita) newErrors.data_nascita = 'Obbligatorio';
      if (!d.sesso) newErrors.sesso = 'Obbligatorio';
      if (d.codice_fiscale) {
        const r = validateCodiceFiscale(d.codice_fiscale);
        if (!r.valid) newErrors.codice_fiscale = r.message;
      }
    }
    if (step === 4) {
      if (!d.residenza_indirizzo) newErrors.residenza_indirizzo = 'Obbligatorio';
      if (!d.residenza_cap) newErrors.residenza_cap = 'Obbligatorio';
      else { const r = validateCAP(d.residenza_cap); if (!r.valid) newErrors.residenza_cap = r.message; }
      if (!d.residenza_localita) newErrors.residenza_localita = 'Obbligatorio';
      if (!d.residenza_provincia) newErrors.residenza_provincia = 'Obbligatorio';
      else { const r = validateProvincia(d.residenza_provincia); if (!r.valid) newErrors.residenza_provincia = r.message; }
    }
    if (step === 5) {
      if (!d.cellulare) newErrors.cellulare = 'Obbligatorio';
      else { const r = validateCellulare(d.cellulare); if (!r.valid) newErrors.cellulare = r.message; }
      if (!d.email) newErrors.email = 'Obbligatorio';
      else { const r = validateEmail(d.email); if (!r.valid) newErrors.email = r.message; }
    }
    if (step === 6) {
      if (!d.tipo_documento) newErrors.tipo_documento = 'Obbligatorio';
      if (!d.numero_documento) newErrors.numero_documento = 'Obbligatorio';
      if (!d.data_rilascio) newErrors.data_rilascio = 'Obbligatorio';
      if (!d.ente_rilascio) newErrors.ente_rilascio = 'Obbligatorio';
    }
    if (step === 10) {
      if (!d.tipo_reddito) newErrors.tipo_reddito = 'Obbligatorio';
      if (!d.reddito) newErrors.reddito = 'Obbligatorio';
    }
    if (step === 12 && d.modalita_pagamento === 'SDD (Addebito su Conto Corrente)') {
      if (d.codice_iban) {
        const r = validateIBAN(d.codice_iban);
        if (!r.valid) newErrors.codice_iban = r.message;
      }
    }
    if (step === 13) {
      if (!d.consenso_privacy) newErrors.consenso_privacy = 'Obbligatorio';
      if (!d.consenso_veridicita) newErrors.consenso_veridicita = 'Obbligatorio';
      if (!d.consenso_trattamento) newErrors.consenso_trattamento = 'Obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const saveDraft = useCallback(async (data) => {
    setIsSaving(true);
    const toSave = {
      ...data,
      current_step: currentStep,
      completion_percentage: calculateCompletion(data),
      campi_mancanti: getMissingFields(data),
      fields_metadata: metadata,
      last_saved: new Date().toISOString(),
    };

    if (calculateCompletion(data) === 100 && data.stato_pratica === 'bozza') {
      toSave.stato_pratica = 'completata';
    } else if (calculateCompletion(data) > 0 && data.stato_pratica === 'bozza') {
      toSave.stato_pratica = 'incompleta';
    }

    if (recordId) {
      await base44.entities.FinancingRequest.update(recordId, toSave);
    } else {
      if (!toSave.pratica_id) toSave.pratica_id = `PRT-${Date.now()}`;
      const created = await base44.entities.FinancingRequest.create(toSave);
      setRecordId(created.id);
    }
    setLastSaved(moment().format('HH:mm'));
    setIsSaving(false);
  }, [currentStep, metadata, recordId]);

  const handleNext = useCallback(async () => {
    if (currentStep === 13) {
      if (!validateStep(13)) return;
      const finalData = { ...formData, data_conferma: new Date().toISOString(), stato_pratica: 'inviata' };
      setFormData(finalData);
      await saveDraft(finalData);
      navigate(`/conferma?record_id=${recordId}`);
      return;
    }
    validateStep(currentStep);
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    await saveDraft(formData);
    setCurrentStep(prev => Math.min(prev + 1, 13));
    window.scrollTo(0, 0);
  }, [currentStep, formData, saveDraft, validateStep, navigate, recordId]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }, []);

  const handleGoToMissing = useCallback(() => {
    const missing = getMissingFields(formData);
    if (missing.length === 0) return;
    const firstMissing = missing[0];
    for (const step of STEPS) {
      if (step.fields.includes(firstMissing)) {
        setCurrentStep(step.id);
        break;
      }
    }
  }, [formData]);

  function handleExtractionDone(result) {
    setExtractionResult(result);
    setScanPhase('review');
  }

  function handleExtractionConfirmed(fields) {
    // Normalize cittadinanza from AI extraction
    if (fields.cittadinanza) {
      fields.cittadinanza = /ital/i.test(fields.cittadinanza) ? 'Italiana' : 'Altra';
    } else {
      fields.cittadinanza = 'Italiana';
    }
    setFormData(prev => ({ ...prev, ...fields }));
    const newMeta = {};
    for (const key of Object.keys(fields)) {
      newMeta[key] = { source: 'ai_gemini', editable: true };
    }
    setMetadata(prev => ({ ...prev, ...newMeta }));
    setScanPhase('form');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const AppHeader = ({ subtitle }) => (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">Richiesta Finanziamento</h1>
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </header>
  );

  if (scanPhase === 'scan' || scanPhase === 'review') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle={scanPhase === 'scan' ? 'Step 0 — Scansione documento' : 'Verifica dati estratti'} />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
            {scanPhase === 'scan' && (
              <DocumentScanner
                onExtracted={handleExtractionDone}
                onSkip={() => setScanPhase('form')}
              />
            )}
            {scanPhase === 'review' && extractionResult && (
              <ExtractionReview
                extraction={extractionResult}
                onConfirm={handleExtractionConfirmed}
                onRetry={() => setScanPhase('scan')}
              />
            )}
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-6">
            I tuoi dati sono al sicuro e verranno trattati secondo la normativa vigente
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Ti guideremo passo dopo passo" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <ProgressHeader
          percentage={percentage}
          missingCount={missingCount}
          onGoToMissing={handleGoToMissing}
          lastSaved={lastSaved}
        />

        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
          {renderStep()}
          {currentStep === 1 && (
            <WizardSharePanel
              recordId={recordId}
              praticaId={formData.pratica_id}
              customerEmail={formData.email}
              customerName={formData.nome && formData.cognome ? `${formData.nome} ${formData.cognome}` : ''}
            />
          )}
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
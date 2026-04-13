import { FileText, Users, User, MapPin, Phone, CreditCard, Flag, Briefcase, Building2, Banknote, UsersRound, Wallet, ShieldCheck } from 'lucide-react';

export const STEPS = [
  { id: 1, title: "Dati Pratica", subtitle: "Riferimenti della polizza", icon: FileText, fields: ['pratica_id', 'numero_preventivo', 'numero_polizza', 'intermediario', 'prodotto_compagnia', 'importo_finanziare', 'premio_polizza', 'data_apertura'] },
  { id: 2, title: "Tipo Soggetto", subtitle: "Richiedente o coobbligato", icon: Users, fields: ['tipo_soggetto', 'ha_coobbligato', 'grado_parentela'] },
  { id: 3, title: "Dati Anagrafici", subtitle: "I tuoi dati personali", icon: User, fields: ['cognome', 'nome', 'data_nascita', 'luogo_nascita', 'codice_fiscale', 'sesso', 'stato_civile'] },
  { id: 4, title: "Residenza", subtitle: "Dove vivi", icon: MapPin, fields: ['residenza_indirizzo', 'residenza_civico', 'residenza_cap', 'residenza_localita', 'residenza_provincia', 'tipo_abitazione'] },
  { id: 5, title: "Recapiti", subtitle: "Come contattarti", icon: Phone, fields: ['cellulare', 'email'] },
  { id: 6, title: "Documento", subtitle: "Documento d'identità", icon: CreditCard, fields: ['tipo_documento', 'numero_documento', 'data_rilascio', 'localita_rilascio', 'ente_rilascio'] },
  { id: 7, title: "Cittadinanza", subtitle: "Nazionalità", icon: Flag, fields: ['cittadinanza'] },
  { id: 8, title: "Occupazione", subtitle: "La tua attività", icon: Briefcase, fields: ['attivita_lavorativa'] },
  { id: 9, title: "Datore di Lavoro", subtitle: "Informazioni azienda", icon: Building2, fields: ['datore_ragione_sociale'] },
  { id: 10, title: "Reddito", subtitle: "Situazione economica", icon: Banknote, fields: ['tipo_reddito', 'numero_mensilita', 'reddito'] },
  { id: 11, title: "Socio-Demografici", subtitle: "Nucleo familiare", icon: UsersRound, fields: ['numero_familiari', 'rapporto_banca_posta'] },
  { id: 12, title: "Pagamento", subtitle: "Modalità di pagamento", icon: Wallet, fields: ['modalita_pagamento'] },
  { id: 13, title: "Conferma", subtitle: "Privacy e invio", icon: ShieldCheck, fields: ['consenso_privacy', 'consenso_veridicita', 'consenso_trattamento'] },
];

export const REQUIRED_FIELDS = {
  pratica_id: true,
  cognome: true,
  nome: true,
  data_nascita: true,
  codice_fiscale: true,
  sesso: true,
  residenza_indirizzo: true,
  residenza_cap: true,
  residenza_localita: true,
  residenza_provincia: true,
  cellulare: true,
  email: true,
  tipo_documento: true,
  numero_documento: true,
  data_rilascio: true,
  ente_rilascio: true,
  cittadinanza: true,
  attivita_lavorativa: true,
  tipo_reddito: true,
  reddito: true,
  modalita_pagamento: true,
  consenso_privacy: true,
  consenso_veridicita: true,
  consenso_trattamento: true,
};

export function calculateCompletion(formData) {
  const allRequired = Object.keys(REQUIRED_FIELDS);
  const filled = allRequired.filter(f => {
    const v = formData[f];
    if (typeof v === 'boolean') return v === true;
    return v !== undefined && v !== null && v !== '';
  });
  return Math.round((filled.length / allRequired.length) * 100);
}

export function getMissingFields(formData) {
  return Object.keys(REQUIRED_FIELDS).filter(f => {
    const v = formData[f];
    if (typeof v === 'boolean') return v !== true;
    return v === undefined || v === null || v === '';
  });
}
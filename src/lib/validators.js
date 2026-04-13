export function validateCodiceFiscale(cf) {
  if (!cf) return { valid: false, message: "Codice fiscale obbligatorio" };
  const cleaned = cf.toUpperCase().replace(/\s/g, '');
  if (cleaned.length !== 16) return { valid: false, message: "Il codice fiscale deve avere 16 caratteri" };
  const pattern = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  if (!pattern.test(cleaned)) return { valid: false, message: "Formato codice fiscale non valido" };
  return { valid: true, message: "" };
}

export function validateIBAN(iban) {
  if (!iban) return { valid: false, message: "IBAN obbligatorio" };
  const cleaned = iban.toUpperCase().replace(/\s/g, '');
  if (!/^IT\d{2}[A-Z]\d{22}$/.test(cleaned)) return { valid: false, message: "Formato IBAN italiano non valido (es. IT60X0542811101000000123456)" };
  return { valid: true, message: "" };
}

export function validateEmail(email) {
  if (!email) return { valid: false, message: "Email obbligatoria" };
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return { valid: false, message: "Formato email non valido" };
  return { valid: true, message: "" };
}

export function validateCellulare(cell) {
  if (!cell) return { valid: false, message: "Cellulare obbligatorio" };
  const cleaned = cell.replace(/\s/g, '').replace(/^\+39/, '');
  if (!/^3\d{8,9}$/.test(cleaned)) return { valid: false, message: "Inserisci un numero di cellulare italiano valido (es. 3XX XXXXXXX)" };
  return { valid: true, message: "" };
}

export function validateCAP(cap) {
  if (!cap) return { valid: false, message: "CAP obbligatorio" };
  if (!/^\d{5}$/.test(cap)) return { valid: false, message: "Il CAP deve essere di 5 cifre" };
  return { valid: true, message: "" };
}

export function validateProvincia(prov) {
  if (!prov) return { valid: false, message: "Provincia obbligatoria" };
  if (!/^[A-Z]{2}$/i.test(prov)) return { valid: false, message: "Inserisci la sigla della provincia (es. MI, RM)" };
  return { valid: true, message: "" };
}

export function validateRequired(value, label) {
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `${label} è un campo obbligatorio` };
  }
  return { valid: true, message: "" };
}

export function formatCurrency(value) {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

export function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const EXTRACTION_PROMPT = `Analizza questa immagine di un documento di identità italiano e estrai tutte le informazioni visibili.
Rispondi SOLO con un oggetto JSON valido, senza markdown o testo aggiuntivo.

Estrai:
- document_type: tipo documento ("Carta d'Identità", "Patente", "Passaporto", "Tessera Ministeriale")
- first_name: nome
- last_name: cognome
- tax_code: codice fiscale
- gender: sesso ("Maschio" o "Femmina")
- birth_date: data di nascita in formato YYYY-MM-DD
- birth_place: luogo di nascita
- document_number: numero documento
- issue_date: data rilascio in formato YYYY-MM-DD
- expiry_date: data scadenza in formato YYYY-MM-DD
- issuing_authority: ente rilascio ("Comune", "Prefettura / Motorizzazione", "Questura", "Ministero")
- issue_place: luogo rilascio
- nationality: cittadinanza ("Italiana" o nome paese)
- address: indirizzo se presente
- raw_text: tutto il testo grezzo visibile nel documento
- confidence: oggetto con score 0-1 per ogni campo estratto (first_name, last_name, tax_code, birth_date, document_number, gender, birth_place, issue_date, issue_place, issuing_authority)
- warnings: array di stringhe con avvisi (es. "immagine sfocata", "campo parzialmente visibile")
- needs_manual_review: true se qualche campo ha bassa confidenza

NON inventare valori. Usa null per campi non leggibili. Usa formato date ISO YYYY-MM-DD.`;

async function analyzeWithGemini(base64Image, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [{
      parts: [
        { text: EXTRACTION_PROMPT },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Clean up markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

function mapToFormFields(extracted) {
  const mapping = {};

  if (extracted.last_name) mapping.cognome = extracted.last_name;
  if (extracted.first_name) mapping.nome = extracted.first_name;
  if (extracted.birth_date) mapping.data_nascita = extracted.birth_date;
  if (extracted.birth_place) mapping.luogo_nascita = extracted.birth_place;
  if (extracted.tax_code) mapping.codice_fiscale = extracted.tax_code.toUpperCase();
  if (extracted.gender) mapping.sesso = extracted.gender;
  if (extracted.document_type) mapping.tipo_documento = extracted.document_type;
  if (extracted.document_number) mapping.numero_documento = extracted.document_number;
  if (extracted.issue_date) mapping.data_rilascio = extracted.issue_date;
  if (extracted.issue_place) mapping.localita_rilascio = extracted.issue_place;
  if (extracted.issuing_authority) mapping.ente_rilascio = extracted.issuing_authority;
  if (extracted.nationality) {
    mapping.cittadinanza = extracted.nationality === 'Italiana' ? 'Italiana' : 'Altra';
    if (extracted.nationality !== 'Italiana') mapping.cittadinanza_altra = extracted.nationality;
  }

  // Parse address if available
  if (extracted.address) {
    const parts = extracted.address.split(',').map(p => p.trim());
    if (parts.length >= 1) mapping.residenza_indirizzo = parts[0];
    if (parts.length >= 2) mapping.residenza_localita = parts[1];
  }

  return mapping;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, file_front_url, file_back_url } = await req.json();

    const primaryUrl = file_url || file_front_url;
    if (!primaryUrl) {
      return Response.json({ error: 'Nessun file fornito' }, { status: 400 });
    }

    // Download file and convert to base64
    const fileRes = await fetch(primaryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*,application/pdf,*/*',
      },
      redirect: 'follow',
    });
    if (!fileRes.ok) throw new Error(`Impossibile scaricare il file (status ${fileRes.status})`);
    
    const buffer = await fileRes.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    const contentType = fileRes.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0];

    // Extract data with Gemini
    const extracted = await analyzeWithGemini(base64, mimeType);

    // If back image provided, try to merge additional data
    if (file_back_url) {
      const backRes = await fetch(file_back_url);
      if (backRes.ok) {
        const backBuffer = await backRes.arrayBuffer();
        const backBytes = new Uint8Array(backBuffer);
        let backBinary = '';
        for (let i = 0; i < backBytes.length; i++) {
          backBinary += String.fromCharCode(backBytes[i]);
        }
        const backBase64 = btoa(backBinary);
        const backMime = (backRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
        
        const backExtracted = await analyzeWithGemini(backBase64, backMime);
        
        // Merge: fill nulls from front with back data
        for (const key of Object.keys(backExtracted)) {
          if (key === 'confidence' || key === 'warnings') continue;
          if ((extracted[key] === null || extracted[key] === undefined) && backExtracted[key]) {
            extracted[key] = backExtracted[key];
          }
        }
        // Merge confidence scores
        if (backExtracted.confidence) {
          extracted.confidence = { ...backExtracted.confidence, ...extracted.confidence };
        }
      }
    }

    const formFields = mapToFormFields(extracted);

    return Response.json({
      success: true,
      extracted,
      form_fields: formFields,
      extracted_at: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      fallback: true
    }, { status: 200 }); // Return 200 so frontend can handle gracefully
  }
});
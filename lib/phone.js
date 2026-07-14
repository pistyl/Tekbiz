/**
 * Normalise un numéro de téléphone au format E.164 (ex: +221771234567).
 * Si le numéro ne commence pas par +, on suppose par défaut le Sénégal (+221).
 */
export function formatToE164(phone) {
  if (!phone) return '';
  let clean = phone.trim().replace(/\s+/g, '');
  if (clean.startsWith('+')) return clean;
  if (clean.startsWith('00')) return '+' + clean.substring(2);
  
  // Si c'est un numéro local sénégalais de 9 chiffres (ex: 771234567, 78..., 76..., 70..., 33...)
  if (clean.length === 9 && (clean.startsWith('7') || clean.startsWith('3'))) {
    return '+221' + clean;
  }
  
  // Si le numéro commence déjà par 221 mais sans le +
  if (clean.startsWith('221') && clean.length === 12) {
    return '+' + clean;
  }
  
  return clean;
}

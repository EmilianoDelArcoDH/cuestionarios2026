/**
 * Genera un slug a partir de un string
 * @param {string} text - Texto a convertir en slug
 * @returns {string} - Slug generado
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '') // Elimina caracteres no alfanuméricos
    .replace(/\-\-+/g, '-') // Reemplaza múltiples guiones con uno solo
    .replace(/^-+/, '') // Elimina guiones del inicio
    .replace(/-+$/, ''); // Elimina guiones del final
}

/**
 * Fisher-Yates shuffle algorithm para mezclar arrays aleatoriamente
 * @param {Array} array - Array a mezclar
 * @returns {Array} - Nuevo array mezclado
 */
export function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Compara dos arrays de UUIDs para verificar si contienen los mismos elementos
 * @param {string[]} arr1 - Primer array de UUIDs
 * @param {string[]} arr2 - Segundo array de UUIDs
 * @returns {boolean} - True si contienen los mismos elementos
 */
export function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  
  return sorted1.every((value, index) => value === sorted2[index]);
}

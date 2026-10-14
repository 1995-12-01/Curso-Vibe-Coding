/**
 * @file storageRepo.js
 * @description Repositorio para la carga de comprobantes y evidencias de pago a Firebase Storage.
 * Incluye fallback automático a DataURL para funcionamiento sin interrupciones.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Sube una imagen de evidencia de pago a Firebase Storage.
 * @param {File} file Archivo de imagen seleccionado
 * @param {string} expenseId ID del gasto asociado
 * @returns {Promise<string>} URL de descarga de la imagen subida
 */
export async function uploadPaymentReceipt(file, expenseId) {
  if (!file) return '';

  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filePath = `receipts/${expenseId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('⚠️ [Storage] Subida a Firebase Storage falló o emulador inactivo. Usando DataURL local como respaldo:', error);

    // Fallback: Convertir el archivo a base64 Data URL para permitir la prueba inmediata
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}

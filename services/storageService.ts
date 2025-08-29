import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from './firebaseConfig';

/**
 * Convierte un storage path a URL de descarga
 * @param storagePath - Path en Firebase Storage (ej: "catalog/tomato/main.jfif")
 * @returns URL completa para mostrar la imagen
 */
export async function getImageURL(storagePath: string): Promise<string> {
  try {
    if (!storagePath) {
      return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&h=200&fit=crop';
    }
    
    // Si ya es una URL completa, devolverla tal como está
    if (storagePath.startsWith('http')) {
      return storagePath;
    }
    
    // Convertir path a URL
    const storageRef = ref(storage, storagePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    // Fallback a imagen por defecto
    return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&h=200&fit=crop';
  }
}

/**
 * Convierte múltiples storage paths a URLs
 */
export async function getImageURLs(storagePaths: string[]): Promise<string[]> {
  const urlPromises = storagePaths.map(path => getImageURL(path));
  return Promise.all(urlPromises);
}
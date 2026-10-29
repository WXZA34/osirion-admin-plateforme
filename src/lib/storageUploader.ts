/**
 * OSIRION HIGH-SPEED STORAGE UPLOADER
 * Solution ultra-rapide et résiliente pour le téléversement de médias vers Firebase Storage.
 * - Envoi direct en flux continu (Single-Stream REST via XMLHttpRequest) évitant les ralentissements
 *   et micro-paquets de 256 Ko du SDK standard.
 * - Compression client-side instantanée pour les images (Avatars, miniatures).
 * - Suivi précis en temps réel du pourcentage, des mégaoctets et du débit (Mo/s).
 */

export interface UploadProgressInfo {
  progress: number; // 0 - 100
  transferredBytes: number;
  totalBytes: number;
  transferredMb: string;
  totalMb: string;
  speedMbPerSec: string;
}

const STORAGE_BUCKET = 'valerion-55414.firebasestorage.app';

/**
 * Optimise et compresse une image côté client en quelques millisecondes
 * Réduit les photos de smartphones (5-15 Mo) à 150-350 Ko nets sans perte visible.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            resolve(new File([blob], cleanName, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Téléverse un fichier directement sur Firebase Storage via HTTP Stream (haute vitesse)
 * avec suivi d'avancement continu (0% à 100%) et calcul de vitesse.
 */
export function uploadFileDirect(
  storagePath: string,
  file: File,
  onProgress?: (info: UploadProgressInfo) => void,
  abortSignalRef?: { cancel?: () => void }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cleanPath = storagePath.replace(/^\/+/, '');
    const encodedPath = encodeURIComponent(cleanPath);
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?name=${encodedPath}`;

    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    if (abortSignalRef) {
      abortSignalRef.cancel = () => {
        try {
          xhr.abort();
        } catch (e) {
          console.warn('Erreur annulation XHR:', e);
        }
      };
    }

    xhr.open('POST', uploadUrl, true);
    
    // Type MIME
    const contentType = file.type || 'application/octet-stream';
    xhr.setRequestHeader('Content-Type', contentType);

    // Suivi de progression continu haute fréquence
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
          const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
          const speedBytesPerSec = event.loaded / elapsedSec;
          const speedMbPerSec = (speedBytesPerSec / (1024 * 1024)).toFixed(1);

          if (onProgress) {
            onProgress({
              progress,
              transferredBytes: event.loaded,
              totalBytes: event.total,
              transferredMb: (event.loaded / (1024 * 1024)).toFixed(1),
              totalMb: (event.total / (1024 * 1024)).toFixed(1),
              speedMbPerSec,
            });
          }
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const token = response.downloadTokens;
          // Format standard et pérenne de lien de téléchargement Firebase Storage
          const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media${token ? `&token=${token}` : ''}`;
          
          if (onProgress) {
            const totalMb = (file.size / (1024 * 1024)).toFixed(1);
            onProgress({
              progress: 100,
              transferredBytes: file.size,
              totalBytes: file.size,
              transferredMb: totalMb,
              totalMb: totalMb,
              speedMbPerSec: '0',
            });
          }
          resolve(downloadUrl);
        } catch (err: any) {
          reject(new Error(`Réponse inattendue du serveur de stockage : ${err.message}`));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          const msg = errData?.error?.message || `Erreur HTTP ${xhr.status}`;
          reject(new Error(`Firebase Storage (${xhr.status}) : ${msg}`));
        } catch {
          reject(new Error(`Échec du transfert vers Firebase Storage (HTTP ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("La connexion réseau vers Firebase Storage a été interrompue."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Le délai maximal de téléversement a expiré."));
    };

    xhr.onabort = () => {
      reject(new Error("Téléversement annulé par l'utilisateur."));
    };

    // Timeout de 15 minutes max pour vidéos lourdes
    xhr.timeout = 15 * 60 * 1000;

    xhr.send(file);
  });
}

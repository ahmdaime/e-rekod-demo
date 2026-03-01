// Helper to check if we're in browser
export const isBrowser = typeof window !== "undefined";

// ============================================
// IMAGE COMPRESSION (Canvas API — tiada dependency Supabase)
// ============================================

const MAX_DIMENSION = 1024;
const COMPRESS_QUALITY = 0.5;

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
          });
          resolve(compressed);
        },
        "image/jpeg",
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Gagal memproses gambar"));
    };
    img.src = URL.createObjectURL(file);
  });
}

// ============================================
// MOCK STORAGE HELPERS (convert ke data URL)
// ============================================

export async function uploadPsvImage(
  file: File,
  _muridId: string,
  _tugasanId: string
): Promise<{ url: string | null; error: string | null }> {
  // Compress gambar terlebih dahulu
  let fileToUpload = file;
  try {
    fileToUpload = await compressImage(file);
  } catch {
    // Guna fail asal jika compress gagal
  }

  // Convert ke data URL (base64) untuk demo
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, error: null });
    };
    reader.onerror = () => {
      resolve({ url: null, error: "Gagal membaca fail gambar" });
    };
    reader.readAsDataURL(fileToUpload);
  });
}

export async function deletePsvImage(_imageUrl: string): Promise<void> {
  // No-op untuk demo
}

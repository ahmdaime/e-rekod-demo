import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to check if we're in browser
export const isBrowser = typeof window !== "undefined";

// ============================================
// IMAGE COMPRESSION
// ============================================

const MAX_DIMENSION = 1024; // piksel maksimum lebar/tinggi
const COMPRESS_QUALITY = 0.5; // kualiti JPEG (0.5 = ~50%)

/**
 * Compress gambar menggunakan Canvas API.
 * Kecilkan resolusi jika melebihi MAX_DIMENSION dan tukar ke JPEG.
 * Contoh: 4MB foto telefon → ~200-500KB selepas compress.
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Kecilkan jika melebihi had
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
        resolve(file); // fallback: return original
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
    img.onerror = () => reject(new Error("Gagal memproses gambar"));
    img.src = URL.createObjectURL(file);
  });
}

// ============================================
// SUPABASE STORAGE HELPERS
// ============================================
const PSV_BUCKET = "psv-evidence";

export async function uploadPsvImage(
  file: File,
  muridId: string,
  tugasanId: string
): Promise<{ url: string | null; error: string | null }> {
  // Compress gambar sebelum upload
  let fileToUpload = file;
  try {
    fileToUpload = await compressImage(file);
  } catch {
    // Jika compress gagal, guna fail asal
  }

  const path = `${muridId}/${tugasanId}_${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(PSV_BUCKET)
    .upload(path, fileToUpload, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(PSV_BUCKET)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}

export async function deletePsvImage(imageUrl: string): Promise<void> {
  // Only delete from Storage if it's a Storage URL (not base64)
  if (!imageUrl || imageUrl.startsWith("data:")) return;

  try {
    // Extract path from public URL: .../storage/v1/object/public/psv-evidence/PATH
    const marker = `/storage/v1/object/public/${PSV_BUCKET}/`;
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;

    const path = decodeURIComponent(imageUrl.slice(idx + marker.length));
    await supabase.storage.from(PSV_BUCKET).remove([path]);
  } catch {
    // Silent fail on cleanup - not critical
  }
}

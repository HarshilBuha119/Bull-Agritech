// services/cloudinary.ts
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  exifData?: any;
  originalSize?: number;
};

const CLOUDINARY_CLOUD_NAME = 'ds3x2mbi3';
const CLOUDINARY_UPLOAD_PRESET = 'mini_vault';

// Tag used to group all MiniPhotoVault images for the public JSON list API
// See: https://res.cloudinary.com/<cloud_name>/image/list/<tag>.json [web:90][web:87]
const CLOUDINARY_TAG = 'mini_photo_vault';

/**
 * Upload a single image (base64) to Cloudinary with:
 * - folder
 * - tag (for later listing)
 * - context (stores exif + originalSize so Gallery can read it)
 */
export const uploadToCloudinary = async (
  imageUri: string,
  originalSize: number,
  exifData?: any,
): Promise<UploadResult> => {
  console.log('\n================ START UPLOAD (base64) ================');

  try {
    console.log('📍 STEP 1: Raw image URI:', imageUri);

    const path =
      Platform.OS === 'android'
        ? imageUri.replace('file://', '')
        : imageUri.replace('file://', '');

    console.log('📍 STEP 2: Normalized file path:', path);
    console.log('📍 STEP 3: Reading file as base64...');
    const base64 = await RNFS.readFile(path, 'base64');
    console.log('✅ STEP 3 DONE: base64 length =', base64.length);

    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'mini_photo_vault');

    // Tag so we can query all vault photos from client using /image/list/<tag>.json [web:90][web:96]
    formData.append('tags', CLOUDINARY_TAG);

    // Store metadata in context so we can read it back from list response [web:93][web:94]
    try {
      const contextParts: string[] = [];
      if (typeof originalSize === 'number') {
        contextParts.push(`originalSize=${originalSize}`);
      }
      if (exifData) {
        const encoded = encodeURIComponent(JSON.stringify(exifData));
        contextParts.push(`exif=${encoded}`);
      }
      if (contextParts.length > 0) {
        // context is "key=value|key2=value2"
        formData.append('context', contextParts.join('|'));
        console.log('📦 STEP 4: Context attached:', contextParts.join('|'));
      } else {
        console.log('📦 STEP 4: No extra context to attach');
      }
    } catch (e) {
      console.warn('⚠️ Failed to encode context:', e);
    }

    console.log('📦 STEP 5: FormData ready, starting upload...');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    console.log('📥 RESPONSE STATUS:', response.status);
    console.log('📥 RESPONSE DATA (short):', {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      created_at: data.created_at,
      error: data.error,
    });

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    console.log('🎉 SUCCESS: Upload complete (base64)');

    // Attempt to read context back (optional – Gallery will also read it later)
    let parsedExif: any = exifData;
    let parsedOriginalSize: number | undefined = originalSize;

    try {
      const custom = data.context?.custom;
      if (custom?.exif && !parsedExif) {
        parsedExif = JSON.parse(decodeURIComponent(custom.exif));
      }
      if (custom?.originalSize && !parsedOriginalSize) {
        parsedOriginalSize = Number(custom.originalSize);
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse context from upload response:', e);
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      createdAt: data.created_at,
      exifData: parsedExif,
      originalSize: parsedOriginalSize,
    };
  } catch (error: any) {
    console.log('💥 FINAL ERROR (base64):', error?.message || String(error));
    throw error;
  } finally {
    console.log('================ END UPLOAD (base64) ================\n');
  }
};

/**
 * Fetch all photos that were uploaded with tag CLOUDINARY_TAG
 * using Cloudinary's public JSON list endpoint (no API secret needed). [web:90][web:87][web:96]
 *
 * URL shape:
 *   https://res.cloudinary.com/<cloud_name>/image/list/<tag>.json
 */
export const fetchAllPhotos = async (): Promise<UploadResult[]> => {
  console.log('\n================ FETCH ALL PHOTOS ================');

  const listUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${CLOUDINARY_TAG}.json`;
  console.log('📍 STEP 1: List URL:', listUrl);

  try {
    const res = await fetch(listUrl);
    console.log('📥 STEP 2: HTTP status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.log('💥 STEP 2 ERROR BODY:', text);
      throw new Error(`List request failed: ${res.status}`);
    }

    const json: any = await res.json();
    console.log('📥 STEP 3: JSON keys:', Object.keys(json || {}));

    const resources: any[] = Array.isArray(json.resources)
      ? json.resources
      : [];

    console.log('📊 STEP 4: resources count:', resources.length);

    const mapped: UploadResult[] = resources.map((r, index) => {
      // Try to use secure_url if present, otherwise build URL manually
      const url =
        r.secure_url ||
        r.url ||
        `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v${r.version}/${r.public_id}.${r.format}`;

      let exifData: any | undefined;
      let originalSize: number | undefined;

      try {
        const custom = r.context?.custom;
        if (custom?.exif) {
          exifData = JSON.parse(decodeURIComponent(custom.exif));
        }
        if (custom?.originalSize) {
          originalSize = Number(custom.originalSize);
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse context for resource #${index}:`, e);
      }

      const result: UploadResult = {
        url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        createdAt: r.created_at,
        exifData,
        originalSize: originalSize ?? r.bytes, // fallback
      };

      return result;
    });

    console.log('✅ STEP 5: Mapped UploadResult items:', mapped.length);
    console.log('================ END FETCH ALL PHOTOS ================\n');

    return mapped;
  } catch (error: any) {
    console.log(
      '💥 FINAL ERROR (fetchAllPhotos):',
      error?.message || String(error),
    );
    throw error;
  }
};
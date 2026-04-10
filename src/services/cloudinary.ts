import RNFS from 'react-native-fs';
import {ExifData} from './exif';

const CLOUD_NAME = 'ds3x2mbi3';
const UPLOAD_PRESET = 'mini_vault';
const TAG = 'mini_photo_vault';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  exifData?: ExifData | null;
  originalSize?: number;
}

export const uploadToCloudinary = async (
  imageUri: string,
  originalSize: number,
  exifData?: ExifData | null,
): Promise<UploadResult> => {
  const path = imageUri.replace('file://', '');
  const base64 = await RNFS.readFile(path, 'base64');

  const contextParts: string[] = [`originalSize=${originalSize}`];
  if (exifData) {
    contextParts.push(`exif=${encodeURIComponent(JSON.stringify(exifData))}`);
  }

  const formData = new FormData();
  formData.append('file', `data:image/jpeg;base64,${base64}`);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'mini_photo_vault');
  formData.append('tags', TAG);
  formData.append('context', contextParts.join('|'));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {method: 'POST', body: formData},
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Upload failed');

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    createdAt: data.created_at,
    exifData,
    originalSize,
  };
};

export const fetchAllPhotos = async (): Promise<UploadResult[]> => {
  const res = await fetch(
    `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`,
  );

  if (!res.ok) throw new Error(`Failed to fetch photos: ${res.status}`);

  const json = await res.json();
  const resources: any[] = Array.isArray(json.resources) ? json.resources : [];

  return resources.map(r => {
    const url =
      r.secure_url ||
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${r.version}/${r.public_id}.${r.format}`;

    let exifData: ExifData | null = null;
    let originalSize: number | undefined;
    // bytes from list API is always 0 so we derive compressed size
    // from originalSize * 0.75 as best estimate if bytes missing
    let bytes: number = r.bytes || 0;

    try {
      const custom = r.context?.custom;
      if (custom?.exif) {
        exifData = JSON.parse(decodeURIComponent(custom.exif));
      }
      if (custom?.originalSize) {
        originalSize = Number(custom.originalSize);
        // If bytes is 0 from list API, estimate from compression ratio
        if (!bytes && originalSize) {
          bytes = Math.round(originalSize * 0.75);
        }
      }
    } catch {}

    return {
      url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      bytes,
      createdAt: r.created_at,
      exifData,
      originalSize,
    };
  });
};
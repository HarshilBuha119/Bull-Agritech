// cloudinary.ts (alternate implementation)
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

const CLOUDINARY_CLOUD_NAME = 'ds3x2mbi3';
const CLOUDINARY_UPLOAD_PRESET = 'mini_vault';

export const uploadToCloudinary = async (
  imageUri: string,
  originalSize: number,
  exifData?: any,
): Promise<UploadResult> => {
  console.log('\n================ START UPLOAD (base64) ================');

  try {
    console.log('📍 STEP 1: Image URI:', imageUri);

    const path =
      Platform.OS === 'android'
        ? imageUri.replace('file://', '')
        : imageUri.replace('file://', '');

    console.log('📍 STEP 2: Reading file as base64...', path);
    const base64 = await RNFS.readFile(path, 'base64');

    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'mini_photo_vault');

    console.log('📦 STEP 3: FormData ready (base64)');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    console.log('📥 RESPONSE STATUS:', response.status);
    console.log('📥 RESPONSE DATA:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    console.log('🎉 SUCCESS: Upload complete (base64)');

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
  } catch (error: any) {
    console.log('💥 FINAL ERROR (base64):', error.message);
    throw error;
  } finally {
    console.log('================ END UPLOAD (base64) ================\n');
  }
};
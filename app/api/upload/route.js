import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const isCloudinaryConfigured = 
      cloudName && cloudName !== 'your-cloud-name' &&
      apiKey && apiKey !== 'your-api-key' &&
      apiSecret && apiSecret !== 'your-api-secret';

    if (isCloudinaryConfigured) {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp: timestamp,
        folder: 'tekbiz'
      };

      // Sort parameters alphabetically
      const sortedKeys = Object.keys(paramsToSign).sort();
      const signatureString = sortedKeys
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&') + apiSecret;

      const signature = crypto
        .createHash('sha1')
        .update(signatureString)
        .digest('hex');

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('api_key', apiKey);
      uploadFormData.append('timestamp', timestamp.toString());
      uploadFormData.append('signature', signature);
      uploadFormData.append('folder', 'tekbiz');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
      }

      return NextResponse.json({ success: true, url: data.secure_url });
    }

    // Fallback: Convert file to base64 Data URL (fully serverless-compatible)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const fileUrl = `data:${mimeType};base64,${base64Data}`;

    console.warn('Cloudinary non configuré, repli sur le format Base64 local.');
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'upload du fichier' }, { status: 500 });
  }
}


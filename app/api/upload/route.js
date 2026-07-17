import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // 1. Essai avec Cloudflare R2
    const r2AccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const r2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    const isR2Configured = 
      r2AccountId && r2AccountId !== 'your-cloudflare-account-id' &&
      r2AccessKeyId && r2AccessKeyId !== 'your-cloudflare-r2-access-key-id' &&
      r2SecretAccessKey && r2SecretAccessKey !== 'your-cloudflare-r2-secret-access-key' &&
      r2BucketName && r2BucketName !== 'your-cloudflare-r2-bucket-name' &&
      r2PublicUrl && r2PublicUrl !== 'https://your-public-bucket-url.r2.dev';

    if (isR2Configured) {
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
      });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uniqueId = crypto.randomUUID();
      const fileName = `${uniqueId}.${fileExtension}`;
      const key = `tekbiz/${fileName}`;
      const contentType = file.type || 'image/jpeg';

      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);

      const fileUrl = `${r2PublicUrl.replace(/\/$/, '')}/${key}`;
      return NextResponse.json({ success: true, url: fileUrl });
    }

    // 2. Essai avec Cloudinary (Fallback secondaire)
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

    // 3. Fallback tertiaire : Convertir le fichier en Base64 Data URL (mode dev)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const fileUrl = `data:${mimeType};base64,${base64Data}`;

    console.warn('Ni R2 ni Cloudinary configurés, repli sur le format Base64 local.');
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'upload du fichier' }, { status: 500 });
  }
}


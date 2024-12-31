import { createFiles, createUploadBucketURL } from '~/team-accounts/src/server/actions/files/create/create-file';
import { generateUUID } from '~/utils/generate-uuid';


export const uploadFileToBucket = async (
  file: File,
  bucketName: string,
  userId: string,
  t: (key: string) => string
) => {
  const uuid = generateUUID();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
  
  const urlData = await createUploadBucketURL(bucketName, filePath);

  if (!urlData || 'error' in urlData || !urlData.signedUrl) {
    throw new Error(t('video.uploadUrlError'));
  }

  const uploadResponse = await fetch(urlData.signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(t('video.uploadError'));
  }

  const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;

  const fileData = await createFiles([
    {
      name: sanitizedFileName,
      size: file.size,
      type: file.type,
      url: fileUrl,
      user_id: userId,
    },
  ]);

  if (!fileData) {
    throw new Error(t('video.databaseEntryError'));
  }

  return fileData[0]?.url ?? fileUrl;
};

export const isYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};

export const isValidVideoUrl = (url: string | null): boolean => {
  return !!url && url.toLowerCase() !== 'video';
};


export const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i,
      /^[^"&?/\s]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1] ?? null;
    }

    return null;
  };
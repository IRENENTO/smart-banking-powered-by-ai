import { supabase } from '../../lib/supabase';

const PROFILE_BUCKET = 'profile-pictures';

export const supabaseStorage = {
  ensureBucket: async () => {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === PROFILE_BUCKET)) {
      await supabase.storage.createBucket(PROFILE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
    }
  },

  uploadProfilePicture: async (userId: string | number, file: File) => {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(PROFILE_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  deleteProfilePicture: async (userId: string | number) => {
    const { data: files } = await supabase.storage
      .from(PROFILE_BUCKET)
      .list(String(userId));

    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from(PROFILE_BUCKET).remove(paths);
    }
  },

  getProfilePictureUrl: (userId: string | number) => {
    const { data } = supabase.storage
      .from(PROFILE_BUCKET)
      .getPublicUrl(`${userId}/profile.jpg`);

    return data.publicUrl;
  },
};

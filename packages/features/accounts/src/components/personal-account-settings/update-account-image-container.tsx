'use client';

import { useCallback } from 'react';



import type { SupabaseClient } from '@supabase/supabase-js';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Database } from '@kit/supabase/database';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { ImageUploader } from '@kit/ui/image-uploader';
import { Trans } from '@kit/ui/trans';

import { useRevalidatePersonalAccountDataQuery } from '../../hooks/use-personal-account-data';

const AVATARS_BUCKET = 'account_image';

export function UpdateAccountImageContainer({
  user,
  bucketName = AVATARS_BUCKET,
  showDescriptions = true,
  floatingDeleteButton = false,
  className,
}: {
  user: {
    pictureUrl: string | null;
    id: string;
  };
  bucketName?: string;
  showDescriptions?: boolean;
  floatingDeleteButton?: boolean;
  className?: string;
}) {
  const revalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  return (
    <UploadProfileAvatarForm
      pictureUrl={user.pictureUrl ?? null}
      userId={user.id}
      onAvatarUpdated={() => revalidateUserDataQuery(user.id)}
      bucketName={bucketName}
      floatingDeleteButton={floatingDeleteButton}
      showDescriptions={showDescriptions}
      className={className}
    />
  );
}

function UploadProfileAvatarForm(props: {
  pictureUrl: string | null;
  userId: string;
  onAvatarUpdated: () => void;
  bucketName?: string;
  floatingDeleteButton?: boolean;
  showDescriptions?: boolean;
  className?: string;
  useAvatar?: boolean;
}) {
  const client = useSupabase();
  const { t } = useTranslation('account');

  const createToaster = useCallback(
    (promise: () => Promise<unknown>) => {
      return toast.promise(promise, {
        success: t(`updateProfileSuccess`),
        error: t(`updateProfileError`),
        loading: t(`updateProfileLoading`),
      });
    },
    [t],
  );

  const onValueChange = useCallback(
    (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (props.pictureUrl) {
          return (
            deleteProfilePhoto(client, props.pictureUrl, props.bucketName) ??
            Promise.resolve()
          );
        }

        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingStorageFile().then(() =>
            uploadUserProfilePhoto(client, file, props.userId, props.bucketName)
              .then((pictureUrl) => {
                return client
                  .from('user_settings')
                  .update({
                    picture_url: pictureUrl,
                  })
                  .eq('user_id', props.userId)
                  .throwOnError();
              })
              .then(() => {
                props.onAvatarUpdated();
              }),
          );

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingStorageFile()
            .then(() => {
              return client
                .from('user_settings')
                .update({
                  picture_url: null,
                })
                .eq('user_id', props.userId)
                .throwOnError();
            })
            .then(() => {
              props.onAvatarUpdated();
            });

        createToaster(promise);
      }
    },
    [client, createToaster, props],
  );

  return (
    <ImageUploader
      value={props.pictureUrl}
      onValueChange={onValueChange}
      floatingDeleteButton={props.floatingDeleteButton}
      className={props.className}
    >
      {props.showDescriptions && (
        <div className={'flex flex-col space-y-1'}>
          <span className={'text-sm'}>
            <Trans i18nKey={'account:profilePictureHeading'} />
          </span>

          <span className={'text-xs'}>
            <Trans i18nKey={'account:profilePictureSubheading'} />
          </span>
        </div>
      )}
    </ImageUploader>
  );
}

function deleteProfilePhoto(
  client: SupabaseClient<Database>,
  url: string,
  bucketName?: string,
) {
  const bucket = client.storage.from(bucketName ?? AVATARS_BUCKET);
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return;
  }

  return bucket.remove([fileName]);
}

async function uploadUserProfilePhoto(
  client: SupabaseClient<Database>,
  photoFile: File,
  userId: string,
  bucketName?: string,
) {
  const bytes = await photoFile.arrayBuffer();
  const bucket = client.storage.from(bucketName ?? AVATARS_BUCKET);
  const extension = photoFile.name.split('.').pop();
  const fileName = await getAvatarFileName(userId, extension);

  const result = await bucket.upload(fileName, bytes);

  if (!result.error) {
    return bucket.getPublicUrl(fileName).data.publicUrl;
  }

  throw result.error;
}

async function getAvatarFileName(
  userId: string,
  extension: string | undefined,
) {
  const { nanoid } = await import('nanoid');

  // we add a version to the URL to ensure
  // the browser always fetches the latest image
  const uniqueId = nanoid(16);

  return `${userId}.${extension}?v=${uniqueId}`;
}
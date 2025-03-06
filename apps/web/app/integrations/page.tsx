import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { EmbedSection } from './components/embed-section';
export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('integrations:title'),
  };
};

// Embed data model:
// {
//   id: string;
//   title: string;
//   description: string;
//   icon: string;
//   value: string;
//   type: 'link' | 'iframe';
//   location: 'tab' | 'sidebar';
//   visibility: 'public' | 'private';
//   organization_id: string;
//   created_at: string;
//   updated_at: string;
//   deleted_on: string | null;
//   user_id: string;
// }

// Embed types:
// - link: a link to an external website
// - iframe: an iframe to an external website

// Embed locations:
// - tab: position on "integrations" and each embed will be a tab (current implementation)
// - sidebar:  position on integrations dropdown menu on the sidebar and each embed will be a sidebar

const embeds = [
  {
    id: '1',
    title: 'Softlink - Project Management',
    value: 'https://softlink.vercel.app/projects',
    description: '',
    type: 'iframe' as const,
    location: 'tab' as const,
    visibility: 'public' as const,
    organization_id: 'cfb5aa65-328e-497c-8b47-2d430492d992',
    created_at: '2025-03-04',
    updated_at: null,
    deleted_on: null,
    user_id: 'a083e250-1412-45a7-959d-f948c811998e',
  },
  {
    id: '2',
    title: 'Suuper - Landing Page',
    value: 'https://suuper.co/',
    icon: 'https://suuper.co/wp-content/uploads/2024/07/Suuper-Favicon-150x150.png',
    description: '',
    type: 'iframe' as const,
    location: 'tab' as const,
    visibility: 'public' as const,
    organization_id: 'cfb5aa65-328e-497c-8b47-2d430492d992',
    created_at: '2025-03-04',
    updated_at: null,
    deleted_on: null,
    user_id: 'a083e250-1412-45a7-959d-f948c811998e',
  },
  {
    id: '3',
    title: 'GPT-4 - Video',
    value: 'https://www.youtube.com/watch?v=Sq5EoFK-U9M',
    icon: 'https://i.pinimg.com/236x/e9/05/00/e90500ba7622570901821fe23881e504.jpg',
    description: '',
    type: 'link' as const,
    location: 'tab' as const,
    visibility: 'public' as const,
    organization_id: 'cfb5aa65-328e-497c-8b47-2d430492d992',
    created_at: '2025-03-04',
    updated_at: null,
    deleted_on: null,
    user_id: 'a083e250-1412-45a7-959d-f948c811998e',
  },
  {
    id: '4',
    title: 'Google - Calendar',
    value: `<iframe src="https://calendar.google.com/calendar/embed?src=juan.garzon%40suuper.co&ctz=America%2FBogota" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe>`,
    icon: 'https://excalidraw.com/images/excalidraw-logo.svg',
    description: '',
    type: 'iframe' as const,
    location: 'tab' as const,
  },
];

function IntegrationsPage() {
  return (
    <PageBody className="flex h-full flex-col gap-8 p-8 py-8 lg:px-8">
      <h1 className="text-2xl font-bold">Integrations</h1>

      <div className="flex h-full w-full gap-8">
        {/* Embeds Content */}
        <EmbedSection embeds={embeds} />
      </div>
    </PageBody>
  );
}

export default withI18n(IntegrationsPage);

import { useTranslation } from 'react-i18next';

import { Annotation } from '~/lib/annotations.types';

interface AnnotationsCommentsPanelProps {
  currentFileType: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  annotations: Annotation.Type[];
  renderAnnotationsContent: () => React.ReactNode;
}
const AnnotationsCommentsPanel = ({
  currentFileType,
  activeTab,
  setActiveTab,
  annotations,
  renderAnnotationsContent,
}: AnnotationsCommentsPanelProps) => {
  const { t } = useTranslation('orders');
  return (
    <>
      {!currentFileType.startsWith('video/') && (
        <div className="flex min-h-0 w-80 flex-col">
          <div className="flex h-10 shrink-0 border-b">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'active'
                  ? 'border-b-2 border-brand text-brand'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('active')}
            >
              {t('annotations.chat.active')} (
              {annotations.filter((a) => a.status === 'active').length})
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'resolved'
                  ? 'border-b-2 border-brand text-brand'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('resolved')}
            >
              {t('annotations.chat.resolved')} (
              {annotations.filter((a) => a.status === 'completed').length})
            </button>
          </div>
          <div className="flex flex-col overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2">
            {renderAnnotationsContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default AnnotationsCommentsPanel;

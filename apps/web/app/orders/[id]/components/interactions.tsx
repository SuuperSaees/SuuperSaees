import { useEffect, useMemo, useRef } from 'react';

import { format } from 'date-fns';

import { useActivityContext } from '../context/activity-context';
import ActivityAction from './activity-actions';
import UserMessage from './user-message';
import UserReviewMessage from './user-review-message';
import UserFirstMessage from './user-first-message';
import { Check } from 'lucide-react';

import { AgencyStatus } from '~/lib/agency-statuses.types';

import { DataSource } from '../context/activity.types';

const Interactions = ({
  agencyStatuses,
}: {
  agencyStatuses: AgencyStatus.Type[];
}) => {
  const {
    messages,
    files,
    activities,
    reviews,
    userRole,
    order,
    briefResponses,
  } = useActivityContext();
  console.log('messages', messages);
  const notValidFormTypes = useMemo(
    () => new Set(['h1', 'h2', 'h3', 'h4', 'rich-text', 'image', 'video']),
    [],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredFiles = useMemo(() => {
    if (!briefResponses) {
      return [];
    }

    const fileFields = briefResponses.filter(
      (formField) =>
        formField.field?.type === 'file' && formField.response?.trim(),
    );

    const fileUrlsFromForm = fileFields
      .flatMap((formField) => formField.response.split(','))
      .map((url) => url.trim());

    return files.filter((file) => !fileUrlsFromForm.includes(file.url));
  }, [briefResponses, files]);

  const interactionsContainerRef = useRef<HTMLDivElement>(null);

  // Combine all items into a single array with filtering based on user role

  const briefFieldsInteraction = useMemo(() => {
    if (!briefResponses) return null;

    const briefFields = briefResponses
      .filter((a) => a?.field?.position !== undefined)
      .sort((a, b) => (a.field?.position ?? 0) - (b.field?.position ?? 0))
      .filter(
        (formField) => !notValidFormTypes.has(formField.field?.type ?? ''),
      );

    const combinedBriefs = {
      class: 'brief-field',
      created_at: order.created_at || new Date().toISOString(),
      userSettings: briefResponses[0]?.userSettings || {},
      fields: briefFields,
    };

    return { briefs: [combinedBriefs] };
  }, [briefResponses, order, notValidFormTypes]);

  const combinedInteractions = [
    ...(briefFieldsInteraction?.briefs ?? []),
    ...messages
      .filter((message) =>
        !['agency_owner', 'agency_member', 'agency_project_manager'].includes(
          userRole,
        )
          ? message.visibility !== 'internal_agency'
          : true,
      )
      .map((message) => ({ ...message, class: 'message' })),
    ...filteredFiles.map((file) => ({ ...file, class: 'file' })),
    ...activities.map((activity) => ({ ...activity, class: 'activity' })),
    ...reviews.map((review) => ({ ...review, class: 'review' })),
  ];

  // Sort combined interactions by date/time (oldest first)
  const sortedInteractions = combinedInteractions.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Group interactions by day
  const groupedInteractions = sortedInteractions.reduce(
    (groups, interaction) => {
      const date = format(new Date(interaction.created_at), 'MMMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(interaction);
      return groups;
    },
    {} as Record<string, typeof combinedInteractions>,
  );
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom / last item with smooth behaviour
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
<div
  className=" flex h-full max-h-[calc(100vh-358px)] w-full min-w-0 shrink flex-grow flex-col gap-4 overflow-y-auto px-8 box-border"
  ref={interactionsContainerRef}
>
      {Object.entries(groupedInteractions).map(([date, interactions]) => (
        <div key={date} className="flex flex-col gap-8">
          <div className="relative mt-2 flex w-full items-center justify-center rounded-md before:absolute before:left-0 before:top-1/2 before:h-[0.3px] before:w-full before:bg-gray-100">
            <h3 className="z-[10] whitespace-nowrap rounded-full border border-gray-300 bg-white p-1 px-2 pr-[1rem] text-sm font-semibold text-gray-700">
              {date}
            </h3>
          </div>
          {interactions.map((interaction) => {
            return interaction.class === 'brief-field' ? (
              <div className="flex w-full">
                <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-200 p-1">
                  <Check className="text-green-700" />
                </div>
                <UserFirstMessage
                  interaction={interaction}
                  key={interaction.id}
                />
              </div>
            ) : interaction.class === 'message' ? (
              <div className="flex w-full" key={interaction.id}>
                <UserMessage message={interaction as DataSource.Message} />
              </div>
            ) : interaction.class === 'activity' ? (
              <ActivityAction
                activity={interaction as DataSource.Activity}
                key={interaction.id}
                agencyStatuses={agencyStatuses}
              />
            ) : interaction.class === 'review' ? (
              <UserReviewMessage
                review={interaction as DataSource.Review}
                key={interaction.id}
              />
            ) : null;
          })}
          <div ref={messagesEndRef} />
        </div>
      ))}
    </div>
  );
};

export default Interactions;

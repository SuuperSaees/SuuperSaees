import { useEffect, useMemo, useRef } from 'react';

import { format } from 'date-fns';

import {
  Activity,
  Message,
  Review,
  useActivityContext,
} from '../context/activity-context';
import ActivityAction from './activity-actions';
import UserMessage from './user-message';
import UserReviewMessage from './user-review-message';
import { fetchFormfieldsWithResponses } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import { useQuery } from '@tanstack/react-query';
import UserFirstMessage from './user-first-message';
import { Check } from 'lucide-react';

const Interactions = () => {
  const { messages, files, activities, reviews, userRole, order } = useActivityContext();

  const briefsWithResponsesQuery = useQuery({
    queryKey: ['briefsWithResponses', order.brief_ids],
    queryFn: async () => await fetchFormfieldsWithResponses(order.uuid),
  });

  const notValidFormTypes = new Set([
    'h1', 'h2', 'h3', 'h4', 'rich-text', 'image', 'video'
  ]);

  const filteredFiles = useMemo(() => {
    if (briefsWithResponsesQuery.isLoading || !briefsWithResponsesQuery.data) {
      return []; 
    }
  
    const fileFields = briefsWithResponsesQuery.data.filter(
      (formField) =>
        formField.field?.type === "file" && formField.response?.trim()
    );
  
    const fileUrlsFromForm = fileFields
      .flatMap((formField) => formField.response.split(","))
      .map((url) => url.trim());
  
    return files.filter((file) => !fileUrlsFromForm.includes(file.url));
  }, [briefsWithResponsesQuery, files]);
  

  const interactionsContainerRef = useRef<HTMLDivElement>(null);

  // Combine all items into a single array with filtering based on user role

  const briefFieldsInteraction = useMemo(() => {
    if (!briefsWithResponsesQuery.data) return null;
  
    const briefFields = briefsWithResponsesQuery.data
      .filter((a) => a?.field?.position !== undefined)
      .sort((a, b) => (a.field?.position ?? 0) - (b.field?.position ?? 0))
      .filter(
        (formField) =>
          !notValidFormTypes.has(formField.field?.type ?? '')
      );
  
    const combinedBriefs = {
      class: 'brief-field',
      created_at: order.created_at || new Date().toISOString(),
      userSettings: briefsWithResponsesQuery.data[0]?.userSettings || {}, 
      fields: briefFields, 
    };
  
    return { briefs: [combinedBriefs] };
  }, [briefsWithResponsesQuery.data, order]);
  

  const combinedInteractions = [
    ...briefFieldsInteraction?.briefs ?? [],
    ...messages
      .filter((message) =>
        !['agency_owner', 'agency_member', 'agency_project_manager'].includes(
          userRole,
        )
          ? message.visibility !== 'internal_agency'
          : true,
      )
      .map((message) => ({ ...message, class: 'message' })),
      ...filteredFiles.map((file) => ({ ...file, class: "file" })),
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

  // Scroll to bottom / last item with smooth behaviour
  useEffect(() => {
    if (interactionsContainerRef.current) {
      interactionsContainerRef.current.scrollTo({
        top: interactionsContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [sortedInteractions]);

  return (
    <div
      className="no-scrollbar max-h-[calc(100vh-300px)] ml-2 mr-10 flex h-full w-full min-w-0 shrink flex-grow flex-col gap-4 overflow-y-auto p-0 pr-[2rem] px-8"
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
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-200 p-1 mr-2">
                  <Check className="text-green-700" />
                </div>
                <UserFirstMessage interaction={interaction} key={interaction.id} />
              </div>
            ) : interaction.class === 'message' ? (
              <div className="flex w-full" key={interaction.id}>
                <UserMessage message={interaction as Message} />
              </div>
            ) : interaction.class === 'activity' ? (
              <ActivityAction
                activity={interaction as Activity}
                key={interaction.id}
              />
            ) : interaction.class === 'review' ? (
              <UserReviewMessage
                review={interaction as Review}
                key={interaction.id}
              />
            ) 
            : null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Interactions;

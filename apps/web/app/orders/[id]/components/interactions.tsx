'use client';

import {
  // ActionType,
  // ActivityProvider,
  // ActivityType,
  // User,
  useActivityContext,
} from '../context/activity-context';
import ActivityAction from './activity-actions';
import UserMessage from './user-message';
import UserReviewMessage from './user-review-message';

// const mockedOrder = {
//   id: 2002,
//   title: 'Pedido 29 - Diseño volantes QR',
//   description: 'This is the order details page',
//   status: 'in_progress',
//   priority: 'high',
//   due_date: '2024-08-15',
//   created_at: '2024-08-13',
//   assigned_to: [
//     {
//       name: 'Johna Doe',
//       email: 'john@example.com',
//       picture_url:
//         'https://images.pexels.com/photos/5611966/pexels-photo-5611966.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//     },
//     {
//       name: 'Jane Smith',
//       email: 'jane@example.com',
//       picture_url:
//         'https://images.pexels.com/photos/5333016/pexels-photo-5333016.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
//     },
//     {
//       name: 'Bob Johnson',
//       email: 'bob@example.com',
//       picture_url:
//         'https://images.pexels.com/photos/3290710/pexels-photo-3290710.jpeg?auto=compress&cs=tinysrgb&w=600',
//     },
//     {
//       name: 'Alice Williams',
//       email: 'alice@example.com',
//       picture_url:
//         'https://images.pexels.com/photos/4550985/pexels-photo-4550985.jpeg?auto=compress&cs=tinysrgb&w=600',
//     },
//     {
//       name: 'Tom Davis',
//       email: 'tom@example.com',
//       picture_url:
//         'https://images.pexels.com/photos/6507483/pexels-photo-6507483.jpeg?auto=compress&cs=tinysrgb&w=600',
//     },
//   ],
//   client: {
//     name: 'Fredd',
//     email: 'freed@example.com',
//     picture_url:
//       'https://images.pexels.com/photos/4764224/pexels-photo-4764224.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   },
// };

// const mockFileImages = [
//   {
//     id: '1',
//     url: 'https://i.pinimg.com/736x/6a/ec/54/6aec54dcb14c166c4c9ade98f158c52a.jpg',
//     type: 'image/jpeg',
//     name: 'image1.jpg',
//     size: 3509359,
//     created_at: '2023-04-01T10:00:00Z',
//   },
//   {
//     id: '2',
//     url: 'https://i.pinimg.com/236x/4f/7a/5a/4f7a5ab07ca73f801a77739736414ebc.jpg',
//     type: 'image/png',
//     name: 'image2.png',
//     size: 3509359,
//     created_at: '2023-04-01T11:00:00Z',
//   },
// ];

// const mockMessages = [
//   {
//     id: '1',
//     content:
//       'Hey Olivia, can you please review the latest design when you can?',
//     senderId: '1',
//     updated_at: '2023-05-01T12:03:00Z',
//     created_at: '2023-05-01T12:03:00Z',
//     files: mockFileImages,
//     reactions: [
//       {
//         id: '1',
//         emoji: '���',
//         type: 'like',
//         user: mockedOrder.assigned_to[0] as User,
//       },
//       {
//         id: '2',
//         emoji: '���',
//         type: 'favorite',
//         user: mockedOrder.assigned_to[1] as User,
//       },
//       {
//         id: '3',
//         emoji: '���',
//         type: 'like',
//         user: mockedOrder.assigned_to[2] as User,
//       },
//     ],
//     user: mockedOrder.assigned_to[4] as User,
//   },
//   {
//     id: '2',
//     content: 'Sure, I can do that. When do you need it?',
//     senderId: '2',
//     updated_at: '2023-05-01T12:05:00Z',
//     created_at: '2023-05-01T12:05:00Z',
//     files: [],
//     reactions: [],
//     user: mockedOrder.assigned_to[3] as User,
//   },
// ];

// const mockActivities = [
//   {
//     id: '1',
//     type: ActivityType.MESSAGE,
//     action: ActionType.CREATE,
//     message:
//       'Samuel added a comment to the order Latest design screenshot.jpg ',
//     created_at: '2023-05-01T12:00:00Z',
//     user: mockedOrder.assigned_to[1] as User,
//   },
//   {
//     id: '2',
//     type: ActivityType.STATUS,
//     action: ActionType.UPDATE,
//     message: 'Samuel updated the order status to In Progress',
//     created_at: '2023-05-01T12:05:00Z',
//     user: mockedOrder.assigned_to[1] as User,
//   },
//   {
//     id: '3',
//     type: ActivityType.REVIEW,
//     action: ActionType.CREATE,
//     message: 'Samuel leave a review of 4 stars',
//     created_at: '2023-05-01T12:10:00Z',
//     user: mockedOrder.assigned_to[1] as User,
//   },
// ];
// const mockFiles = [
//   {
//     id: '1',
//     url: 'https://i.pinimg.com/236x/6c/48/7e/6c487e8674e4adc995439c401d9bf3b4.jpg',
//     type: 'image',
//     name: 'web-prototype-1.jpg',
//     size: 3509359,
//     created_at: '2023-04-01T10:00:00Z',
//   },
//   {
//     id: '2',
//     url: 'https://i.pinimg.com/236x/8a/6b/07/8a6b07076e72f75a02e5de3829f876ce.jpg',
//     type: 'image',
//     name: 'web-prototype-2.jpg',
//     size: 3509359,
//     created_at: '2023-04-01T11:00:00Z',
//   },
// ];

// const mockReviews = [
//   {
//     id: '1',
//     rating: 4,
//     content: 'Great work! The design was as i wanted',
//     created_at: '2023-05-01T12:00:00Z',
//     updated_at: '2023-05-01T12:00:00Z',
//     user: mockedOrder.assigned_to[0] as User,
//   },
// ];
const Interactions = () => {
  // const messages = mockMessages;
  // const files = mockFiles;
  // const activities = mockActivities;
  // const reviews = mockReviews;

  const { messages, files, activities, reviews } = useActivityContext();

  // Combine all items into a single array
  const combinedInteractions = [
    ...messages.map((message) => ({ ...message, type: 'message' })),
    ...files.map((file) => ({ ...file, type: 'file' })),
    ...activities.map((activity) => ({ ...activity, type: 'activity' })),
    ...reviews.map((review) => ({ ...review, type: 'review' })),
  ];
  // Sort combined interactions by date/time (oldest first)
  const sortedInteractions = combinedInteractions.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return (
    <div className="flex w-full flex-col gap-8 rounded-lg border border-gray-200 p-4">
      {sortedInteractions.map((interaction) => {
        return interaction.type === 'message' ? (
          <UserMessage key={interaction.id} message={interaction} />
        ) : interaction.type === 'activity' ? (
          <ActivityAction activity={interaction} />
        ) : interaction.type === 'review' ? (
          <UserReviewMessage review={interaction} key={interaction.id} />
        ) : null;
      })}
    </div>
  );
};
export default Interactions;

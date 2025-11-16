import { Order } from './order.types';

export const statuses: Order.Type['status'][] = [
  'pending',
  'in_progress',
  'completed',
  'in_review',
  'annulled',
];

export const priorities = ['low', 'medium', 'high'];

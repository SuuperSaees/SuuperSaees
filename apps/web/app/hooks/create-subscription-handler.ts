import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import {
  isArrayData,
  mergeWithExisting,
  updateArrayData,
} from '~/utils/data-transform';

// Define the possible subscription events
type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE';
// Generic type for handling different kinds of data responses
export type DataResponse = Record<string, unknown>;

export function createSubscriptionHandler<T extends DataResponse>(options?: {
  idField?: keyof T;
  onBeforeUpdate?: (
    payload: RealtimePostgresChangesPayload<T>,
  ) => Promise<void> | void;
  onAfterUpdate?: (updatedData: T | T[]) => Promise<void> | void;
}) {
  return async function handleSubscription(
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
    currentData: T | T[],
    setData: React.Dispatch<React.SetStateAction<T | T[]>>,
  ) {
    const { eventType, new: newData, old: oldData } = payload;
    const idField = options?.idField ?? 'id';

    try {
      // Call the before update hook if provided
      await options?.onBeforeUpdate?.(
        payload as RealtimePostgresChangesPayload<T>,
      );

      // Handle different event types
      switch (eventType as SubscriptionEvent) {
        case 'INSERT': {
          if (isArrayData(currentData)) {
            setData([...currentData, newData as T]);
          } else {
            setData(newData as T);
          }
          break;
        }

        case 'UPDATE': {
          if (isArrayData(currentData)) {
            const updatedItems = updateArrayData(
              currentData,
              newData as Partial<T>,
              idField,
              false,
            );
            setData(updatedItems);
          } else {
            setData((current) =>
              mergeWithExisting(current as T, newData as Partial<T>),
            );
          }
          break;
        }

        case 'DELETE': {
          if (isArrayData(currentData)) {
            setData(
              currentData.filter(
                (item) => item[idField] !== (oldData as T)?.[idField],
              ),
            );
          } else {
            // For single item data, you might want to handle this differently
            console.warn('Received DELETE event for single-item subscription');
          }
          break;
        }
      }

      // Call the after update hook if provided
      await options?.onAfterUpdate?.(currentData);
    } catch (error) {
      console.error('Error handling subscription update:', error);
      // You might want to add error handling logic here
    }
  };
}

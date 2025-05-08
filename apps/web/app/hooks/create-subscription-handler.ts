import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import {
  isArrayData,
  mergeWithExisting,
  updateArrayData,
} from '~/utils/data-transform';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE';
export type DataResponse = Record<string, unknown>;

export function createSubscriptionHandler<T extends DataResponse>(options?: {
  idField?: keyof T;
  onBeforeUpdate?: (
    payload: RealtimePostgresChangesPayload<T>,
  ) => Promise<void | boolean> | void | boolean;
  onAfterUpdate?: (updatedData: T | T[]) => Promise<void> | void;
}) {
  return async function handleSubscription(
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
    currentData: T | T[],
    setData: React.Dispatch<React.SetStateAction<T | T[]>>,
  ) {
    const { eventType, new: newData, old: oldData } = payload;
    const idField = options?.idField && options.idField in newData ? options.idField : 'id';

    try {
      // Call the before update hook if provided
      const beforeUpdateResult = await options?.onBeforeUpdate?.(
        payload as RealtimePostgresChangesPayload<T>,
      );
      // If onBeforeUpdate returns a value, exit early
      if (beforeUpdateResult !== undefined) {
        return;
      }

      // Handle different event types
      switch (eventType as SubscriptionEvent) {
        case 'INSERT': {
          if (isArrayData(currentData)) {
            
            setData((currentData) => {
              const updatedItems = updateArrayData(
                currentData as T[],
                newData as Partial<T>,
                idField,
                true,
              );
              return updatedItems;
            });
          } else {
            setData(newData as T);
          }
          break;
        }

        case 'UPDATE': {
          setData((currentData) => {
            if (isArrayData(currentData)) {
              const updatedItems = updateArrayData(
                currentData,
                newData as Partial<T>,
                idField,
                false,
              );
              return updatedItems;
            } else {
              const updatedItem = mergeWithExisting(
                currentData,
                newData as Partial<T>,
              );
              return updatedItem;
            }
          });

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
            console.warn('Received DELETE event for single-item subscription');
          }
          break;
        }
      }

      // Call the after update hook if provided
      await options?.onAfterUpdate?.(currentData);
    } catch (error) {
      console.error('Error handling subscription update:', error);
    }
  };
}

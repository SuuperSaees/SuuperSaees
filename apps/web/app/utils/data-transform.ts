// Generic type for handling different kinds of data responses
type DataResponse = Record<string, unknown>;

// Helper function to determine if we're working with an array of data
export function isArrayData<T>(data: T | T[]): data is T[] {
  return Array.isArray(data);
}

// Helper function to merge existing data with new data, preserving extra properties
export function mergeWithExisting<T extends DataResponse>(
  existing: T,
  incoming: Partial<T>,
): T {
  // Create a new object that preserves all existing properties
  const merged = { ...existing };

  // Update only the properties that exist in the incoming data
  (Object.keys(incoming) as Array<keyof T>).forEach((key) => {
    if (incoming[key] !== undefined) {
      merged[key] = incoming[key]!;
    }
  });

  return merged;
}

// Helper function to handle array updates with proper typing
export function updateArrayData<T extends DataResponse>(
  currentItems: T[],
  updatedItem: Partial<T>,
  idField: keyof T = 'id',
  allowInserction = true,
): T[] {
  const itemIndex = currentItems.findIndex(
    (item) => item[idField] === updatedItem[idField],
  );

  if (itemIndex === -1) {
    // If the item doesn't exist, add it as a new item
    if (allowInserction) return [...currentItems, updatedItem as T];

    return [...currentItems];
  }

  // Merge the update with the existing item to preserve joined data
  const updatedItems = [...currentItems];

  const existingItem = currentItems[itemIndex]; // Safely extract the existing item
  if (existingItem) {
    updatedItems[itemIndex] = mergeWithExisting(existingItem, updatedItem);
  }

  return updatedItems;
}

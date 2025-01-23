import { KanbanColumn, KanbanItem } from '~/(views)/kanban.types';
import {

  ViewManageableProperty,
  ViewUser,
} from '~/(views)/views.types';
import { formatString } from '~/utils/text-formatter';

// Deep search for a property in an object and return all found values
const deepFindAll = (obj: unknown, key: string): unknown[] => {
  const results: unknown[] = [];

  const search = (current: unknown) => {
    if (!current || typeof current !== 'object') return;

    if (key in current) {
      results.push((current as Record<string, unknown>)[key]);
    }

    if (Array.isArray(current)) {
      current.forEach((item) => search(item));
    } else {
      Object.values(current).forEach((value) => search(value));
    }
  };

  search(obj);
  return results;
};

// Get the most meaningful value from a list of potential values
const getMeaningfulValue = (values: unknown[]): unknown => {
  // Filter out null and undefined
  const validValues = values.filter(
    (v) => v !== null && v !== undefined && v !== '',
  );
  return validValues.length > 0 ? validValues[0] : '';
};

// Helper to check if an object has all required user properties
const hasRequiredUserProperties = (obj: unknown): boolean => {
  if (!obj || typeof obj !== 'object') return false;

  const idValues = deepFindAll(obj, 'id');
  const nameValues = deepFindAll(obj, 'name');
  const pictureValues = deepFindAll(obj, 'picture_url');

  return (
    idValues.some((id) => typeof id === 'string') &&
    nameValues.some((name) => typeof name === 'string' || name === null) &&
    pictureValues.length > 0
  );
};

// Extract user properties from a complex object
const extractUserProperties = (obj: unknown): ViewUser | null => {
  if (!hasRequiredUserProperties(obj)) return null;

  const idValues = deepFindAll(obj, 'id');
  const nameValues = deepFindAll(obj, 'name');
  const pictureValues = deepFindAll(obj, 'picture_url');

  const id = getMeaningfulValue(idValues) as string;
  const name = getMeaningfulValue(nameValues) as string;
  const picture_url = getMeaningfulValue(pictureValues) as string;

  if (!id) return null;

  return {
    id,
    name: name || '',
    picture_url: picture_url || '',
  };
};

// Find a user object in a complex structure
const findUserObject = (obj: unknown): ViewUser | null => {
  if (!obj || typeof obj !== 'object') return null;

  // Check if the current object has user properties
  const user = extractUserProperties(obj);
  if (user) return user;

  // If it's an array, check each item
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findUserObject(item);
      if (found) return found;
    }
    return null;
  }

  // Recursively search through object properties
  for (const key in obj) {
    if (typeof (obj as Record<string, unknown>)[key] === 'object') {
      const found = findUserObject((obj as Record<string, unknown>)[key]);
      if (found) return found;
    }
  }

  return null;
};

// Extract all user objects from a complex structure
const extractUsers = (value: unknown): ViewUser[] => {
  if (!value) return [];

  const users: ViewUser[] = [];

  if (Array.isArray(value)) {
    value.forEach((item) => {
      const userProps = extractUserProperties(item);
      if (userProps) {
        users.push(userProps);
      } else {
        const nestedUser = findUserObject(item);
        if (nestedUser) {
          users.push(nestedUser);
        }
      }
    });
    return users;
  }

  const user = findUserObject(value);
  return user ? [user] : [];
};

// Rest of the code remains the same...
const detectValueType = (
  value: unknown,
): 'string-object-user' | 'string-default' => {
  if (Array.isArray(value)) {
    const users = extractUsers(value);
    if (users.length > 0) {
      return 'string-object-user';
    }
  } else if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      const users = extractUsers(parsed);
      if (users.length > 0) {
        return 'string-object-user';
      }
    } catch (e) {
      // If parsing fails, it's not a JSON string
    }
  } else if (typeof value === 'object' && value !== null) {
    const users = extractUsers(value);
    if (users.length > 0) {
      return 'string-object-user';
    }
  }
  return 'string-default';
};

const formatDisplayName = (
  value: unknown,
  valueType: 'string-object-user' | 'string-default',
): string => {
  if (valueType === 'string-default') {
    const strValue = String(value);
    return strValue
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  const users = extractUsers(value);
  if (users.length > 0) {
    return JSON.stringify(users[0]);
  }

  return String(value);
};

const createColumnsByGroup = <T extends KanbanItem>(
  groupSelected: keyof T,
  data: T[],
  predefinedGroups?: ViewManageableProperty[],
): KanbanColumn[] => {
  // First, create a map of all possible values from the data
  const columns = new Map<
    string,
    {
      value: unknown;
      items: T[];
    }
  >();

  // Process all data items first to get all possible values
  data.forEach((item) => {
    const groupValue = item[groupSelected];
    const valueType = detectValueType(groupValue);

    if (valueType === 'string-object-user') {
      const users = extractUsers(groupValue);
      users.forEach((user) => {
        if (!columns.has(user.id)) {
          columns.set(user.id, {
            value: user,
            items: [{ ...item, column: user.id }].sort((a, b) => a.position - b.position),
          });
        } else {
          columns.get(user.id)!.items.push({ ...item, column: user.id });
        }
      });
    } else {
      const key = String(groupValue);
      if (!columns.has(key)) {
        columns.set(key, {
          value: groupValue,
          items: [{ ...item, column: key }].sort((a, b) => a.position - b.position),
        });
      } else {
        columns.get(key)!.items.push({ ...item, column: key });
      }
    }
  });

  // If predefined groups are provided, use them as a base and merge with actual data
  if (predefinedGroups && predefinedGroups.length > 0) {
    const resultColumns: KanbanColumn[] = predefinedGroups.map((group, index) => {
      const existingColumn = columns.get(group.key);
      const valueType = existingColumn
        ? detectValueType(existingColumn.value)
        : 'string-default';

      return {
        id: group.id ??`column-container-${index}`,
        key: group.key,
        name:
          formatString(group.name, 'capitalize') ||
          formatDisplayName(existingColumn?.value ?? group.key, valueType),
        position: group.position,
        color: group.color ?? '',
        count: {
          total: existingColumn?.items.length ?? 0,
        },
        is_visible: group.visible,
        value_type: valueType,
        items: existingColumn?.items.sort((a, b) => a.position - b.position) ?? [],
        type: groupSelected as keyof KanbanItem,
      };
    });

    // Add any columns that exist in data but not in predefined groups
    const predefinedKeys = new Set(predefinedGroups.map((g) => g.key));

    Array.from(columns.entries())
      .filter(([key]) => !predefinedKeys.has(key))
      .forEach(([key, { value, items }], index) => {
        const valueType = detectValueType(value);

        resultColumns.push({
          id: `column-container-${index}`,
          key,
          name: formatDisplayName(value, valueType),
          position:
            Math.max(...predefinedGroups.map((g) => g.position)) + index + 1,
          color: '',
          count: {
            total: items.length,
          },
          is_visible: true,
          value_type: valueType,
          items: items.sort((a, b) => a.position - b.position),
          type: groupSelected as keyof KanbanItem,
        });
      });
    // Sort by position
    return resultColumns.sort((a, b) => a.position - b.position);
  }

  // If no predefined groups, use the original logic
  return Array.from(columns.entries()).map(([key, { value, items }], index) => {
    const valueType = detectValueType(value);
    return {
      id: `column-container-${index}`,
      key,
      name: formatDisplayName(value, valueType),
      position: index + 1,
      color: '',
      count: {
        total: items.length,
      },
      is_visible: true,
      value_type: valueType,
      items: items.sort((a, b) => a.position - b.position),
      type: groupSelected as keyof KanbanItem,
    };
  });
};
// Convert stringified user object to ViewUser
const parseUser = (user: string): ViewUser => {
  try {
    const parsed = JSON.parse(user);
    return (
      extractUserProperties(parsed) ?? { id: '', name: '', picture_url: '' }
    );
  } catch (e) {
    return { id: '', name: '', picture_url: '' };
  }
};

export { createColumnsByGroup, detectValueType, parseUser };

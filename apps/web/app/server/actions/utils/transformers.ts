import { User } from '~/lib/user.types';

const transformUser = (user: User.Response) => {
  return {
    ...user,
    name: user.settings?.[0]?.name ?? user.name,
    picture_url: user.settings?.[0]?.picture_url ?? user.picture_url,
  };
};

// Function to check if the data has a user settings and is valid to transform it into a User.Response
const hasUser = (data: Record<string, unknown>): data is User.Response => {
  return (
    'settings' in data &&
    Array.isArray(data.settings) &&
    data.settings.length > 0 &&
    'name' in data &&
    'picture_url' in data &&
    'name' in data.settings[0] &&
    'picture_url' in data.settings[0]
  );
};

// Generic function to transform data containing a User
const transformData = <T extends { user?: User.Response | null }>(
  data: T,
): T => {
  if (data.user && hasUser(data.user)) {
    return {
      ...data,
      user: transformUser(data.user),
    };
  }
  return data;
};

// Function to transform an array of data containing Users
const transformDataArray = <T extends { user?: User.Response | null }>(
  data: T[],
): T[] => {
  return data.map(transformData);
};

export { transformUser, transformData, transformDataArray };

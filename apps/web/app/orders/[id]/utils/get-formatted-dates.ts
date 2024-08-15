export const formatDateToString = (
  dateToUpdate: Date,
  type: 'short' | 'long',
) => {
  // short option
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const date = new Date(dateToUpdate).toLocaleDateString(
    undefined,
    dateOptions,
  );
  const time = new Date(dateToUpdate).toLocaleTimeString(
    undefined,
    timeOptions,
  );

  if (type === 'short') {
    return `${date} at ${time}`;
  } else {
    return `${date} ${time}`;
  }
};

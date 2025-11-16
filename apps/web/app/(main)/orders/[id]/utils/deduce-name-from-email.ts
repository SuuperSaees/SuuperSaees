function deduceNameFromEmail(email: string): string {
  const username = email.includes('@') ? email.split('@')[0] : email;

  const cleanedUsername = username?.replace(/[\d\W_]+/g, ' ');

  const nameParts = cleanedUsername?.split(' ').filter((part) => part);
  const capitalizedParts = nameParts?.map(
    (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
  );

  const name = capitalizedParts?.join(' ') ?? '';

  return name;
}

export default deduceNameFromEmail;

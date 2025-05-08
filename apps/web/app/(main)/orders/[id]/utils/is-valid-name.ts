export function isValidName(name: string) {
    const namePattern = /^[a-zA-Z\s]+$/;
    return namePattern.test(name);
}
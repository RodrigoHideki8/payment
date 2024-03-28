export function removeSpecialCharacters(value: string) {
  return value ? value.replace(/[^\w\s]/gi, '') : '';
}

export function isTruthy(value: string | boolean): boolean {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

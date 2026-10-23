/** A page's `searchParams` value: a repeated key arrives as an array, and only the first one counts. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

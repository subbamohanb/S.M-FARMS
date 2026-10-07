export function withCatalogFallback<T>(catalog: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(catalog) && catalog.length > 0 ? catalog : fallback;
}

export function aggregateCartItems(items: Array<{ id: number }>) {
  const quantities = new Map<number, number>();
  for (const item of items) quantities.set(item.id, (quantities.get(item.id) ?? 0) + 1);
  return Array.from(quantities.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

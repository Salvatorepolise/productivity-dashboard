/** Puts an item back at its original position (undo delete, Day 39: shared) */
export function restoreAt(list, item, index) {
  if (list.some((existing) => existing.id === item.id)) return list;
  const position = Math.min(Math.max(index, 0), list.length);
  return [...list.slice(0, position), item, ...list.slice(position)];
}

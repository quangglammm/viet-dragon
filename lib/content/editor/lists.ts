// Reordering the lists of a document. Order is stored twice — the array order and a `position` number per item — and the
// database wants positions without gaps inside a group (the options of one shape, the bullets of one kind…), so every move
// goes through here: swap with the neighbour of the same group, then renumber.

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/** Positions 0, 1, 2… in array order, counted separately inside each group. */
export function renumber<T extends { position: number }>(list: readonly T[], groupOf: (item: T) => string = () => ""): T[] {
  const counters = new Map<string, number>();
  return list.map((item) => {
    const group = groupOf(item);
    const position = counters.get(group) ?? 0;
    counters.set(group, position + 1);
    return item.position === position ? item : { ...item, position };
  });
}

/**
 * Swaps the item at `index` with its neighbour one step up (-1) or down (+1) among the items of its own group, then renumbers.
 * A step beyond the end of the group does nothing.
 */
export function moveWithinGroup<T extends { position: number }>(list: readonly T[], index: number, step: -1 | 1, groupOf: (item: T) => string = () => ""): T[] {
  const group = groupOf(list[index]);
  let target = index + step;
  while (target >= 0 && target < list.length && groupOf(list[target]) !== group) target += step;
  if (target < 0 || target >= list.length) return [...list];
  // A swap of the two slots: the items of other groups keep their places in the array.
  const swapped = [...list];
  [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
  return renumber(swapped, groupOf);
}

/** The next free position in a group (for an item that is being added). */
export function nextPosition<T extends { position: number }>(list: readonly T[], inGroup: (item: T) => boolean = () => true): number {
  return list.filter(inGroup).reduce((highest, item) => Math.max(highest, item.position + 1), 0);
}

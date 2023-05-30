export function maybeJoinFirst(joinChar: string, ...items: string[]) {
  const [item, ...others] = items;
  const start = item.length > 0 ? `${item}${joinChar}` : '';
  return `${start}${others.join(joinChar)}`
}

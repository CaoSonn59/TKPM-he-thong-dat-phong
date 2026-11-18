export const nextId = (xs: { id: number }[]) => Math.max(0, ...xs.map(x => x.id)) + 1

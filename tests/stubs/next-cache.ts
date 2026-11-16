/** No-op stand-ins for next/cache in unit tests. */
const noop = (): undefined => undefined;
export const cacheLife = noop;
export const cacheTag = noop;
export const revalidateTag = noop;

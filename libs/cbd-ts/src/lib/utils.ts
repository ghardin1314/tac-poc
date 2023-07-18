export const toBytes = (str: string): Uint8Array =>
  new TextEncoder().encode(str);

const u8ToBase64Replacer = (_key: string, value: unknown) => {
  if (value instanceof Uint8Array) {
    return `base64:${toBase64(value)}`;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return value;
};

const sortedSerializingReplacer = (_key: string, value: unknown): unknown => {
  const serializedValue = u8ToBase64Replacer(_key, value);
  return sortedReplacer(_key, serializedValue);
};

export const toJsonStr = (obj: unknown) =>
  JSON.stringify(obj, sortedSerializingReplacer);

export const toBase64 = (bytes: Uint8Array) =>
  Buffer.from(bytes).toString('base64');

export const fromBase64 = (str: string) => Buffer.from(str, 'base64');

const sortedReplacer = (_key: string, value: unknown) => {
  if (value instanceof Object && !(value instanceof Array)) {
    return Object.keys(value)
      .sort()
      .reduce((sorted: Record<string, unknown>, key) => {
        sorted[key] = (value as Record<string, unknown>)[key];
        return sorted;
      }, {});
  }

  return value;
};

export function randomBytes(bytesLength = 32): Uint8Array {
  if (crypto && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint8Array(bytesLength));
  }
  throw new Error('crypto.getRandomValues must be defined');
}

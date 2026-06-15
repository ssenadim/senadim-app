export const uuidQuantityOptions = [1, 5, 10, 25, 50] as const;

export type UuidQuantity = (typeof uuidQuantityOptions)[number];

export function generateUuidV4List(quantity: UuidQuantity): string[] {
  if (!crypto.randomUUID) {
    throw new Error("UUID generation is not supported in this browser.");
  }

  return Array.from({ length: quantity }, () => crypto.randomUUID());
}

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

export const hashAlgorithms: Array<{ label: string; value: HashAlgorithm }> = [
  { label: "MD5", value: "md5" },
  { label: "SHA1", value: "sha1" },
  { label: "SHA256", value: "sha256" },
  { label: "SHA512", value: "sha512" },
];

export async function generateHash(input: string, algorithm: HashAlgorithm) {
  if (algorithm === "md5") {
    return md5(input);
  }

  const cryptoAlgorithm: Record<Exclude<HashAlgorithm, "md5">, string> = {
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha512: "SHA-512",
  };
  const digest = await crypto.subtle.digest(
    cryptoAlgorithm[algorithm],
    new TextEncoder().encode(input),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getByteCount(input: string) {
  return new TextEncoder().encode(input).length;
}

function md5(input: string) {
  const rotateLeft = (value: number, amount: number) =>
    (value << amount) | (value >>> (32 - amount));
  const add = (left: number, right: number) => (left + right) >>> 0;
  const cmn = (
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number,
  ) => add(rotateLeft(add(add(a, q), add(x, t)), s), b);
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);
  const words = createMd5Words(input);
  let a = 1732584193;
  let b = 4023233417;
  let c = 2562383102;
  let d = 271733878;

  for (let index = 0; index < words.length; index += 16) {
    const oldA = a;
    const oldB = b;
    const oldC = c;
    const oldD = d;

    a = ff(a, b, c, d, words[index], 7, 3614090360);
    d = ff(d, a, b, c, words[index + 1], 12, 3905402710);
    c = ff(c, d, a, b, words[index + 2], 17, 606105819);
    b = ff(b, c, d, a, words[index + 3], 22, 3250441966);
    a = ff(a, b, c, d, words[index + 4], 7, 4118548399);
    d = ff(d, a, b, c, words[index + 5], 12, 1200080426);
    c = ff(c, d, a, b, words[index + 6], 17, 2821735955);
    b = ff(b, c, d, a, words[index + 7], 22, 4249261313);
    a = ff(a, b, c, d, words[index + 8], 7, 1770035416);
    d = ff(d, a, b, c, words[index + 9], 12, 2336552879);
    c = ff(c, d, a, b, words[index + 10], 17, 4294925233);
    b = ff(b, c, d, a, words[index + 11], 22, 2304563134);
    a = ff(a, b, c, d, words[index + 12], 7, 1804603682);
    d = ff(d, a, b, c, words[index + 13], 12, 4254626195);
    c = ff(c, d, a, b, words[index + 14], 17, 2792965006);
    b = ff(b, c, d, a, words[index + 15], 22, 1236535329);
    a = gg(a, b, c, d, words[index + 1], 5, 4129170786);
    d = gg(d, a, b, c, words[index + 6], 9, 3225465664);
    c = gg(c, d, a, b, words[index + 11], 14, 643717713);
    b = gg(b, c, d, a, words[index], 20, 3921069994);
    a = gg(a, b, c, d, words[index + 5], 5, 3593408605);
    d = gg(d, a, b, c, words[index + 10], 9, 38016083);
    c = gg(c, d, a, b, words[index + 15], 14, 3634488961);
    b = gg(b, c, d, a, words[index + 4], 20, 3889429448);
    a = gg(a, b, c, d, words[index + 9], 5, 568446438);
    d = gg(d, a, b, c, words[index + 14], 9, 3275163606);
    c = gg(c, d, a, b, words[index + 3], 14, 4107603335);
    b = gg(b, c, d, a, words[index + 8], 20, 1163531501);
    a = gg(a, b, c, d, words[index + 13], 5, 2850285829);
    d = gg(d, a, b, c, words[index + 2], 9, 4243563512);
    c = gg(c, d, a, b, words[index + 7], 14, 1735328473);
    b = gg(b, c, d, a, words[index + 12], 20, 2368359562);
    a = hh(a, b, c, d, words[index + 5], 4, 4294588738);
    d = hh(d, a, b, c, words[index + 8], 11, 2272392833);
    c = hh(c, d, a, b, words[index + 11], 16, 1839030562);
    b = hh(b, c, d, a, words[index + 14], 23, 4259657740);
    a = hh(a, b, c, d, words[index + 1], 4, 2763975236);
    d = hh(d, a, b, c, words[index + 4], 11, 1272893353);
    c = hh(c, d, a, b, words[index + 7], 16, 4139469664);
    b = hh(b, c, d, a, words[index + 10], 23, 3200236656);
    a = hh(a, b, c, d, words[index + 13], 4, 681279174);
    d = hh(d, a, b, c, words[index], 11, 3936430074);
    c = hh(c, d, a, b, words[index + 3], 16, 3572445317);
    b = hh(b, c, d, a, words[index + 6], 23, 76029189);
    a = hh(a, b, c, d, words[index + 9], 4, 3654602809);
    d = hh(d, a, b, c, words[index + 12], 11, 3873151461);
    c = hh(c, d, a, b, words[index + 15], 16, 530742520);
    b = hh(b, c, d, a, words[index + 2], 23, 3299628645);
    a = ii(a, b, c, d, words[index], 6, 4096336452);
    d = ii(d, a, b, c, words[index + 7], 10, 1126891415);
    c = ii(c, d, a, b, words[index + 14], 15, 2878612391);
    b = ii(b, c, d, a, words[index + 5], 21, 4237533241);
    a = ii(a, b, c, d, words[index + 12], 6, 1700485571);
    d = ii(d, a, b, c, words[index + 3], 10, 2399980690);
    c = ii(c, d, a, b, words[index + 10], 15, 4293915773);
    b = ii(b, c, d, a, words[index + 1], 21, 2240044497);
    a = ii(a, b, c, d, words[index + 8], 6, 1873313359);
    d = ii(d, a, b, c, words[index + 15], 10, 4264355552);
    c = ii(c, d, a, b, words[index + 6], 15, 2734768916);
    b = ii(b, c, d, a, words[index + 13], 21, 1309151649);
    a = ii(a, b, c, d, words[index + 4], 6, 4149444226);
    d = ii(d, a, b, c, words[index + 11], 10, 3174756917);
    c = ii(c, d, a, b, words[index + 2], 15, 718787259);
    b = ii(b, c, d, a, words[index + 9], 21, 3951481745);
    a = add(a, oldA);
    b = add(b, oldB);
    c = add(c, oldC);
    d = add(d, oldD);
  }

  return [a, b, c, d].map(toLittleEndianHex).join("");
}

function createMd5Words(input: string) {
  const bytes = new TextEncoder().encode(input);
  const length = (((bytes.length + 8) >>> 6) + 1) * 16;
  const words = new Array<number>(length).fill(0);

  bytes.forEach((byte, index) => {
    words[index >> 2] |= byte << ((index % 4) * 8);
  });
  words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  words[length - 2] = bytes.length * 8;

  return words;
}

function toLittleEndianHex(value: number) {
  return [0, 8, 16, 24]
    .map((shift) => ((value >>> shift) & 0xff).toString(16).padStart(2, "0"))
    .join("");
}

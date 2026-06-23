const plantUmlAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function appendEncoded3Bytes(
  encoded: string[],
  byte1: number,
  byte2: number,
  byte3: number,
) {
  const c1 = byte1 >> 2;
  const c2 = ((byte1 & 0x3) << 4) | (byte2 >> 4);
  const c3 = ((byte2 & 0xf) << 2) | (byte3 >> 6);
  const c4 = byte3 & 0x3f;

  encoded.push(
    plantUmlAlphabet[c1],
    plantUmlAlphabet[c2],
    plantUmlAlphabet[c3],
    plantUmlAlphabet[c4],
  );
}

export async function encodePlantUmlSource(source: string) {
  const bytes = new TextEncoder().encode(source);

  if (typeof CompressionStream === "undefined") {
    throw new Error(
      "PlantUML rendering requires a browser with CompressionStream support.",
    );
  }

  const compressed = new Uint8Array(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate")),
    ).arrayBuffer(),
  );
  const rawDeflateBytes = compressed.slice(2, -4);
  const encoded: string[] = [];

  for (let index = 0; index < rawDeflateBytes.length; index += 3) {
    appendEncoded3Bytes(
      encoded,
      rawDeflateBytes[index],
      rawDeflateBytes[index + 1] ?? 0,
      rawDeflateBytes[index + 2] ?? 0,
    );
  }

  return encoded.join("");
}

export function validatePlantUmlSource(source: string) {
  const normalized = source.trim().toLowerCase();

  if (!normalized) {
    return "PlantUML source is empty. Add a diagram between @startuml and @enduml.";
  }

  if (!normalized.includes("@startuml") || !normalized.includes("@enduml")) {
    return "PlantUML source should include @startuml and @enduml markers.";
  }

  return "";
}

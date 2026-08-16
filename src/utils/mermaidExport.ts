const pngScale = 2;
const maxCanvasDimension = 8192;
const maxCanvasPixels = 32_000_000;

function sanitizeFilenamePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function getMermaidExportFilename(
  templateName: string,
  extension: "svg" | "png",
) {
  const name = sanitizeFilenamePart(templateName || "diagram");
  return `mermaid-${name || "diagram"}.${extension}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export function createMermaidSvgBlob(svgText: string) {
  const parsedDocument = new DOMParser().parseFromString(
    svgText,
    "image/svg+xml",
  );

  if (
    parsedDocument.documentElement.tagName.toLowerCase() !== "svg" ||
    parsedDocument.querySelector("parsererror")
  ) {
    throw new Error("The rendered diagram is not a valid SVG.");
  }

  return new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
}

function parseDimension(value: string | null) {
  if (!value || !/^\d+(?:\.\d+)?(?:px)?$/i.test(value.trim())) return 0;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getSvgDimensions(svg: Element) {
  const viewBox = svg
    .getAttribute("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const hasValidViewBox =
    viewBox?.length === 4 &&
    Number.isFinite(viewBox[2]) &&
    viewBox[2] > 0 &&
    Number.isFinite(viewBox[3]) &&
    viewBox[3] > 0;

  if (hasValidViewBox && viewBox) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  return {
    width: parseDimension(svg.getAttribute("width")) || 1,
    height: parseDimension(svg.getAttribute("height")) || 1,
  };
}

function getRasterDimensions(width: number, height: number) {
  const scale = Math.min(
    pngScale,
    maxCanvasDimension / width,
    maxCanvasDimension / height,
    Math.sqrt(maxCanvasPixels / (width * height)),
  );

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The SVG could not be converted."));
    image.src = source;
  });
}

function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("The PNG could not be created."));
    }, "image/png");
  });
}

export async function createMermaidPngBlob(
  svgText: string,
  backgroundColor: string,
) {
  const parsedDocument = new DOMParser().parseFromString(
    svgText,
    "image/svg+xml",
  );
  const svg = parsedDocument.documentElement;

  if (
    svg.tagName.toLowerCase() !== "svg" ||
    parsedDocument.querySelector("parsererror")
  ) {
    throw new Error("The rendered diagram is not a valid SVG.");
  }

  const sourceDimensions = getSvgDimensions(svg);
  const rasterDimensions = getRasterDimensions(
    sourceDimensions.width,
    sourceDimensions.height,
  );
  const svgUrl = URL.createObjectURL(
    new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = rasterDimensions.width;
    canvas.height = rasterDimensions.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable.");

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await canvasToPng(canvas);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

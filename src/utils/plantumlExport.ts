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

export function getPlantUmlExportFilename(
  source: string,
  templateName: string,
  extension: "svg" | "png",
) {
  const declaredName = source.match(/^\s*@startuml(?:\s+([^\r\n]+))?/im)?.[1];
  const name = sanitizeFilenamePart(templateName || declaredName || "diagram");

  return `${name || "diagram"}.${extension}`;
}

async function fetchRenderedSvg(diagramUrl: string) {
  const response = await fetch(diagramUrl, {
    headers: { Accept: "image/svg+xml" },
  });

  if (!response.ok) {
    throw new Error("The rendered SVG could not be retrieved.");
  }

  const svgText = await response.text();
  const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = document.documentElement;

  if (
    svg.tagName.toLowerCase() !== "svg" ||
    document.querySelector("parsererror")
  ) {
    throw new Error("The rendered diagram is not a valid SVG.");
  }

  return { svg, svgText };
}

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function parsePositiveNumber(value: string | null) {
  if (!value) return 0;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getSvgDimensions(svg: Element) {
  const viewBox = svg
    .getAttribute("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const viewBoxWidth =
    viewBox?.length === 4 && Number.isFinite(viewBox[2]) && viewBox[2] > 0
      ? viewBox[2]
      : 0;
  const viewBoxHeight =
    viewBox?.length === 4 && Number.isFinite(viewBox[3]) && viewBox[3] > 0
      ? viewBox[3]
      : 0;
  const width =
    parsePositiveNumber(svg.getAttribute("width")) || viewBoxWidth || 1;
  const height =
    parsePositiveNumber(svg.getAttribute("height")) || viewBoxHeight || 1;

  return { height, width };
}

function getRasterDimensions(width: number, height: number) {
  const scale = Math.min(
    pngScale,
    maxCanvasDimension / width,
    maxCanvasDimension / height,
    Math.sqrt(maxCanvasPixels / (width * height)),
  );

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
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

export async function downloadPlantUmlSvg(
  diagramUrl: string,
  filename: string,
) {
  const { svgText } = await fetchRenderedSvg(diagramUrl);
  downloadBlob(
    new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
    filename,
  );
}

export async function downloadPlantUmlPng(
  diagramUrl: string,
  filename: string,
) {
  const { svg, svgText } = await fetchRenderedSvg(diagramUrl);
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
    if (!context) {
      throw new Error("Canvas rendering is unavailable.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    downloadBlob(await canvasToPng(canvas), filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

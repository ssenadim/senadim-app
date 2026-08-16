import { Alert, Button, Spinner, Textarea } from "flowbite-react";
import mermaid from "mermaid";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import {
  defaultMermaidTemplate,
  mermaidTemplates,
  type MermaidTemplate,
} from "../../../data/mermaidTemplates";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  createMermaidPngBlob,
  createMermaidSvgBlob,
  downloadBlob,
  getMermaidExportFilename,
} from "../../../utils/mermaidExport";
import { routePaths } from "../../../utils/routes";

const genericRenderError =
  "Unable to render diagram. Check the Mermaid syntax and try again.";

type RenderStatus = "idle" | "rendering" | "success" | "failure";
type ExportFormat = "svg" | "png";
type MermaidTheme = "default" | "dark";

let renderSequence = 0;

function getCurrentTheme(): MermaidTheme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "default";
}

function useMermaidTheme() {
  const [theme, setTheme] = useState<MermaidTheme>(getCurrentTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

function getRenderError(error: unknown) {
  if (!(error instanceof Error)) return genericRenderError;

  const detail = error.message.replace(/\s+/g, " ").trim();
  if (!detail) return genericRenderError;

  const conciseDetail =
    detail.length > 240 ? `${detail.slice(0, 237)}...` : detail;
  return `${genericRenderError} Mermaid reported: ${conciseDetail}`;
}

function PreviewState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[24rem] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <div className="flex max-w-md flex-col items-center gap-3">
        {children}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: MermaidTemplate;
  onSelect: (template: MermaidTemplate) => void;
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
        {template.name}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
        {template.description}
      </p>
      <div className="mt-3">
        <Button
          color="light"
          size="xs"
          aria-label={`Use ${template.name} template`}
          onClick={() => onSelect(template)}
        >
          Use Template
        </Button>
      </div>
    </article>
  );
}

export function MermaidViewerPage() {
  usePageTitle("Mermaid Viewer");

  const theme = useMermaidTheme();
  const [source, setSource] = useState(defaultMermaidTemplate.source);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    defaultMermaidTemplate.id,
  );
  const [renderedSvg, setRenderedSvg] = useState("");
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [exportInProgress, setExportInProgress] = useState<ExportFormat | null>(
    null,
  );
  const requestIdRef = useRef(0);
  const exportRequestIdRef = useRef(0);
  const activeSourceRef = useRef<string | null>(null);
  const initialRenderStartedRef = useRef(false);
  const previousThemeRef = useRef(theme);

  const selectedTemplateName =
    mermaidTemplates.find((template) => template.id === selectedTemplateId)
      ?.name ?? "";
  const canExportDiagram = status === "success" && Boolean(renderedSvg);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  const renderDiagram = useCallback(
    async (diagramSource: string) => {
      const requestId = ++requestIdRef.current;
      exportRequestIdRef.current += 1;
      const trimmedSource = diagramSource.trim();

      setRenderedSvg("");
      setError("");
      setExportInProgress(null);

      if (!trimmedSource) {
        activeSourceRef.current = null;
        setStatus("idle");
        return;
      }

      activeSourceRef.current = diagramSource;
      setStatus("rendering");

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          suppressErrorRendering: true,
          htmlLabels: false,
          theme,
        });

        const renderId = `mermaid-diagram-${++renderSequence}`;
        const { svg } = await mermaid.render(renderId, diagramSource);

        if (requestId !== requestIdRef.current) return;

        setRenderedSvg(svg);
        setStatus("success");
      } catch (renderError) {
        if (requestId !== requestIdRef.current) return;

        activeSourceRef.current = null;
        setRenderedSvg("");
        setStatus("failure");
        setError(getRenderError(renderError));
      }
    },
    [theme],
  );

  useEffect(() => {
    if (initialRenderStartedRef.current) return;
    initialRenderStartedRef.current = true;
    void renderDiagram(defaultMermaidTemplate.source);
  }, [renderDiagram]);

  useEffect(() => {
    if (previousThemeRef.current === theme) return;
    previousThemeRef.current = theme;

    const activeSource = activeSourceRef.current;
    if (activeSource) void renderDiagram(activeSource);
  }, [renderDiagram, theme]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      exportRequestIdRef.current += 1;
    },
    [],
  );

  function handleSourceChange(value: string) {
    requestIdRef.current += 1;
    exportRequestIdRef.current += 1;
    activeSourceRef.current = null;
    setSource(value);
    setSelectedTemplateId("");
    setRenderedSvg("");
    setError("");
    setStatus("idle");
    setExportInProgress(null);
  }

  function handleTemplateSelect(template: MermaidTemplate) {
    setSource(template.source);
    setSelectedTemplateId(template.id);
    showToast("info", `${template.name} loaded.`);
    void renderDiagram(template.source);
  }

  async function handleCopySource() {
    if (!source) return;

    try {
      await navigator.clipboard.writeText(source);
      showToast("success", "Mermaid source copied.");
    } catch {
      showToast("failure", "Copy failed. Please copy the source manually.");
    }
  }

  function handleDownloadSvg() {
    if (!canExportDiagram) return;

    setExportInProgress("svg");
    try {
      downloadBlob(
        createMermaidSvgBlob(renderedSvg),
        getMermaidExportFilename(selectedTemplateName, "svg"),
      );
      showToast("success", "SVG downloaded.");
    } catch {
      showToast("failure", "SVG export failed. Please try again.");
    } finally {
      setExportInProgress(null);
    }
  }

  async function handleDownloadPng() {
    if (!canExportDiagram) return;

    const exportRequestId = ++exportRequestIdRef.current;
    setExportInProgress("png");

    try {
      const pngBlob = await createMermaidPngBlob(
        renderedSvg,
        theme === "dark" ? "#111827" : "#ffffff",
      );

      if (exportRequestId !== exportRequestIdRef.current) return;

      downloadBlob(
        pngBlob,
        getMermaidExportFilename(selectedTemplateName, "png"),
      );
      showToast("success", "PNG downloaded.");
    } catch {
      if (exportRequestId !== exportRequestIdRef.current) return;
      showToast("failure", "PNG export failed. Please try again.");
    } finally {
      if (exportRequestId === exportRequestIdRef.current) {
        setExportInProgress(null);
      }
    }
  }

  return (
    <ToolPageLayout
      title="Mermaid Viewer"
      description="Create and preview Mermaid diagrams directly in your browser using text-based diagram definitions."
      breadcrumbs={[
        {
          label: "Architecture & Design",
          path: routePaths.architectureDesign,
        },
        { label: "Mermaid Viewer" },
      ]}
      overviewTitle="What is Mermaid?"
      overviewCollapsible
      overviewToggleLabel="What is Mermaid?"
      overview={
        <p>
          Mermaid is a text-based diagram language for describing flowcharts,
          sequence diagrams, class diagrams, and other technical visuals. This
          viewer renders your source locally in the browser.
        </p>
      }
      inputTitle={null}
      inputs={
        <div className="space-y-5">
          <section
            className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950"
            aria-labelledby="mermaid-templates-heading"
          >
            <h2
              id="mermaid-templates-heading"
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Mermaid Templates
            </h2>
            <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mermaidTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
          </section>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
            <section
              className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              aria-labelledby="mermaid-source-label"
            >
              <label
                htmlFor="mermaid-source"
                id="mermaid-source-label"
                className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
              >
                Mermaid Source
              </label>
              <Textarea
                id="mermaid-source"
                value={source}
                onChange={(event) => handleSourceChange(event.target.value)}
                rows={18}
                wrap="off"
                spellCheck={false}
                aria-describedby={
                  error
                    ? "mermaid-source-guidance mermaid-render-error"
                    : "mermaid-source-guidance"
                }
                aria-invalid={status === "failure"}
                className="min-h-[28rem] max-w-full resize-y overflow-auto font-mono whitespace-pre"
                placeholder="flowchart LR&#10;A[Client] --> B[Service]"
              />
              <p
                id="mermaid-source-guidance"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              >
                Editing clears the current preview. Select Render Diagram when
                you are ready to refresh it.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  color="blue"
                  disabled={status === "rendering"}
                  onClick={() => void renderDiagram(source)}
                >
                  {status === "rendering" ? "Rendering..." : "Render Diagram"}
                </Button>
                <Button
                  color="light"
                  disabled={!source}
                  onClick={() => void handleCopySource()}
                >
                  Copy Mermaid Source
                </Button>
              </div>
            </section>

            <section
              className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950"
              aria-labelledby="mermaid-preview-heading"
              aria-busy={status === "rendering"}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="mermaid-preview-heading"
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Diagram Preview
                </h2>
                <div className="flex max-w-full flex-wrap items-center gap-2">
                  <Button
                    color="light"
                    size="xs"
                    disabled={!canExportDiagram || exportInProgress !== null}
                    aria-describedby="mermaid-export-status"
                    onClick={handleDownloadSvg}
                  >
                    {exportInProgress === "svg"
                      ? "Downloading SVG..."
                      : "Download SVG"}
                  </Button>
                  <Button
                    color="light"
                    size="xs"
                    disabled={!canExportDiagram || exportInProgress !== null}
                    aria-describedby="mermaid-export-status"
                    onClick={() => void handleDownloadPng()}
                  >
                    {exportInProgress === "png"
                      ? "Creating PNG..."
                      : "Download PNG"}
                  </Button>
                </div>
              </div>

              <p
                id="mermaid-export-status"
                className="sr-only"
                aria-live="polite"
              >
                {canExportDiagram
                  ? "SVG and PNG downloads are available for the current diagram."
                  : "Render a valid current diagram to enable SVG and PNG downloads."}
              </p>

              <div aria-live="polite">
                {error ? (
                  <Alert
                    id="mermaid-render-error"
                    color="failure"
                    role="alert"
                    className="mb-4"
                  >
                    <span className="font-semibold">Preview unavailable.</span>{" "}
                    {error}
                  </Alert>
                ) : null}

                {renderedSvg && status === "success" ? (
                  <div className="max-h-[42rem] min-h-96 max-w-full overflow-auto overscroll-contain rounded-lg bg-white p-4 dark:bg-gray-900">
                    <div
                      className="flex min-w-full justify-center [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-none"
                      aria-label="Rendered Mermaid diagram"
                      role="img"
                      dangerouslySetInnerHTML={{ __html: renderedSvg }}
                    />
                  </div>
                ) : status === "rendering" ? (
                  <PreviewState>
                    <Spinner aria-label="Rendering Mermaid diagram" size="lg" />
                    <span>Rendering diagram...</span>
                  </PreviewState>
                ) : status === "failure" ? (
                  <PreviewState>
                    Preview cleared. Update the source and render again.
                  </PreviewState>
                ) : (
                  <PreviewState>
                    {source.trim()
                      ? "Ready to render. Select Render Diagram to create the preview."
                      : "Enter Mermaid syntax and render the diagram to see the preview."}
                  </PreviewState>
                )}
              </div>
            </section>
          </div>
        </div>
      }
      examples={[]}
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Rendering and exports happen entirely in your browser.</li>
          <li>PNG downloads use a high-resolution client-side conversion.</li>
          <li>Strict Mermaid security settings remain enabled.</li>
        </ul>
      }
      notesCollapsible
      toast={<ToolToast toast={toast} />}
    />
  );
}

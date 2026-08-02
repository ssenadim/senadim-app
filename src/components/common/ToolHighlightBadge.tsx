import { Badge } from "flowbite-react";
import type { ToolHighlight } from "../../types/tool";

const highlightColors = {
  New: "success",
  Popular: "info",
  Recommended: "purple",
} as const;

interface ToolHighlightBadgeProps {
  label: ToolHighlight;
}

export function ToolHighlightBadge({ label }: ToolHighlightBadgeProps) {
  return <Badge color={highlightColors[label]}>{label}</Badge>;
}

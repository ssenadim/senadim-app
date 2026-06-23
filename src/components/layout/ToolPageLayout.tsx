import { useState } from "react";
import type { ToolPageLayoutProps } from "../../types/toolPage";
import {
  ToolDescription,
  ToolExamples,
  ToolHeader,
  ToolInputArea,
  ToolNotes,
  ToolResultArea,
} from "./ToolSections";

export function ToolPageLayout({
  title,
  description,
  breadcrumbs,
  overviewTitle,
  overview,
  overviewCollapsible,
  overviewToggleLabel,
  inputs,
  outputs,
  examples,
  onExampleSelect,
  notes,
  notesCollapsible,
  toast,
}: ToolPageLayoutProps) {
  const [areExamplesVisible, setAreExamplesVisible] = useState(false);
  const [areNotesVisible, setAreNotesVisible] = useState(!notesCollapsible);
  const [isOverviewVisible, setIsOverviewVisible] = useState(!overviewCollapsible);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />
      <ToolDescription
        title={overviewTitle}
        isCollapsible={overviewCollapsible}
        isVisible={isOverviewVisible}
        onToggle={() => setIsOverviewVisible((current) => !current)}
        toggleLabel={overviewToggleLabel}
      >
        {overview}
      </ToolDescription>
      {inputs ? <ToolInputArea>{inputs}</ToolInputArea> : null}
      {outputs ? <ToolResultArea>{outputs}</ToolResultArea> : null}

      <ToolExamples
        examples={examples}
        isVisible={areExamplesVisible}
        onToggle={() => setAreExamplesVisible((current) => !current)}
        onExampleSelect={onExampleSelect}
      />

      {notes ? (
        <ToolNotes
          isCollapsible={notesCollapsible}
          isVisible={areNotesVisible}
          onToggle={() => setAreNotesVisible((current) => !current)}
        >
          {notes}
        </ToolNotes>
      ) : null}
      {toast}
    </div>
  );
}

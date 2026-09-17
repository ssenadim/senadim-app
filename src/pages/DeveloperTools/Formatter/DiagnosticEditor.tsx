import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  Compartment,
  EditorState,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  WidgetType,
  drawSelection,
  keymap,
  lineNumbers,
  placeholder as editorPlaceholder,
  type DecorationSet,
} from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { ValidationDiagnostic } from "../../../types/validationDiagnostic";
import "./diagnosticEditor.css";

export interface DiagnosticEditorHandle {
  focusDiagnostic: () => void;
}

interface DiagnosticEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  diagnostic: ValidationDiagnostic | null;
  ariaLabel: string;
  describedBy?: string;
  placeholder?: string;
}

const setDiagnosticEffect = StateEffect.define<ValidationDiagnostic | null>();

class DiagnosticPositionWidget extends WidgetType {
  constructor(private readonly message: string) {
    super();
  }

  eq(other: DiagnosticPositionWidget) {
    return other.message === this.message;
  }

  toDOM() {
    const marker = document.createElement("span");
    marker.className = "cm-formatter-diagnostic-position";
    marker.textContent = "!";
    marker.title = this.message;
    marker.setAttribute("role", "img");
    marker.setAttribute("aria-label", `Validation error: ${this.message}`);
    return marker;
  }
}

function createDiagnosticDecorations(
  state: EditorState,
  diagnostic: ValidationDiagnostic | null,
) {
  if (!diagnostic || diagnostic.startOffset === undefined) {
    return Decoration.none;
  }

  const startOffset = Math.max(
    0,
    Math.min(diagnostic.startOffset, state.doc.length),
  );
  const endOffset = Math.max(
    startOffset,
    Math.min(diagnostic.endOffset ?? startOffset, state.doc.length),
  );

  if (endOffset > startOffset) {
    return Decoration.set([
      Decoration.mark({
        class: "cm-formatter-diagnostic-range",
        attributes: {
          title: diagnostic.message,
          "aria-label": `Validation error: ${diagnostic.message}`,
        },
      }).range(startOffset, endOffset),
    ]);
  }

  const line = state.doc.lineAt(startOffset);
  return Decoration.set(
    [
      Decoration.line({
        class: "cm-formatter-diagnostic-line",
        attributes: { title: diagnostic.message },
      }).range(line.from),
      Decoration.widget({
        widget: new DiagnosticPositionWidget(diagnostic.message),
        side: 1,
      }).range(startOffset),
    ],
    true,
  );
}

const diagnosticField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    let nextDecorations = decorations.map(transaction.changes);

    for (const effect of transaction.effects) {
      if (effect.is(setDiagnosticEffect)) {
        nextDecorations = createDiagnosticDecorations(
          transaction.state,
          effect.value,
        );
      }
    }

    return nextDecorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const editorTheme = EditorView.theme({
  "&": {
    height: "16rem",
    minWidth: "0",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  ".cm-content": {
    minWidth: "max-content",
    padding: "0.75rem 0",
  },
  ".cm-line": {
    padding: "0 0.75rem",
  },
  ".cm-gutters": {
    userSelect: "none",
  },
});

export const DiagnosticEditor = forwardRef<
  DiagnosticEditorHandle,
  DiagnosticEditorProps
>(function DiagnosticEditor(
  { id, value, onChange, diagnostic, ariaLabel, describedBy, placeholder },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const initialConfigurationRef = useRef({ id, ariaLabel, placeholder });
  const contentAttributesCompartmentRef = useRef(new Compartment());

  onChangeRef.current = onChange;

  useImperativeHandle(
    forwardedRef,
    () => ({
      focusDiagnostic() {
        const editor = editorRef.current;
        if (!editor || diagnostic?.startOffset === undefined) {
          return;
        }

        const offset = Math.max(
          0,
          Math.min(diagnostic.startOffset, editor.state.doc.length),
        );
        editor.dispatch({
          selection: { anchor: offset },
          effects: EditorView.scrollIntoView(offset, { y: "center" }),
        });
        editor.focus();
      },
    }),
    [diagnostic],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const initialConfiguration = initialConfigurationRef.current;
    const editor = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: initialValueRef.current,
        extensions: [
          lineNumbers(),
          history(),
          drawSelection(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          contentAttributesCompartmentRef.current.of(
            EditorView.contentAttributes.of({
              id: initialConfiguration.id,
              "aria-label": initialConfiguration.ariaLabel,
              spellcheck: "false",
            }),
          ),
          initialConfiguration.placeholder
            ? editorPlaceholder(initialConfiguration.placeholder)
            : [],
          diagnosticField,
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    editorRef.current = editor;
    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const currentValue = editor.state.doc.toString();
    if (currentValue !== value) {
      editor.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    editorRef.current?.dispatch({
      effects: setDiagnosticEffect.of(diagnostic),
    });
  }, [diagnostic]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const attributes: Record<string, string> = {
      id,
      "aria-label": ariaLabel,
      "aria-invalid": diagnostic ? "true" : "false",
      spellcheck: "false",
    };
    if (describedBy) {
      attributes["aria-describedby"] = describedBy;
    }

    editor.dispatch({
      effects: contentAttributesCompartmentRef.current.reconfigure(
        EditorView.contentAttributes.of(attributes),
      ),
    });
  }, [ariaLabel, describedBy, diagnostic, id]);

  return <div ref={containerRef} className="formatter-diagnostic-editor" />;
});

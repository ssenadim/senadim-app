import { Toast } from "flowbite-react";
import type { ToastMessage, ToastTone } from "../../types/toast";

interface ToolToastProps {
  toast: ToastMessage | null;
}

function getToastClasses(tone: ToastTone) {
  const classes: Record<ToastTone, string> = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    failure:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
    info: "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200",
  };

  return classes[tone];
}

export function ToolToast({ toast }: ToolToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm">
      <Toast
        key={toast.id}
        className={`border shadow-lg ${getToastClasses(toast.tone)}`}
      >
        <div className="text-sm font-medium">{toast.text}</div>
      </Toast>
    </div>
  );
}

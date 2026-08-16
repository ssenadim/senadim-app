import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { SidebarNavigation } from "../navigation/SidebarNavigation";
import { BrandMark } from "./BrandMark";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    return () => {
      const returnFocusElement = returnFocusRef.current;

      if (returnFocusElement?.isConnected) {
        returnFocusElement.focus();
      }

      returnFocusRef.current = null;
    };
  }, [isOpen]);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    if (!firstFocusableElement || !lastFocusableElement) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstFocusableElement) {
      event.preventDefault();
      lastFocusableElement.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === lastFocusableElement
    ) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Main navigation"
      onKeyDown={handleDialogKeyDown}
    >
      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={-1}
        className="absolute inset-0 bg-gray-950/50"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-80 flex-col border-r border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:outline-cyan-400"
          >
            <svg
              className="size-5"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>
        <div className="mt-8">
          <SidebarNavigation onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

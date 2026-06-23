import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title =
      title === "Home"
        ? "Freeshot | Architecture, Platform Engineering and Developer Tools"
        : `${title} | Freeshot`;
  }, [title]);
}

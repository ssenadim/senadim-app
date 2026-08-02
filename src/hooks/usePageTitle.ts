import { useEffect } from "react";
import { pageMetadataByTitle, siteMetadata } from "../data/pageMetadata";

const structuredDataId = "freeshot-software-application";

function setMetaTag(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.content = content;
}

function setCanonicalUrl(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }

  element.href = url;
}

function updateHomeStructuredData(isHome: boolean, description: string) {
  const existingScript = document.getElementById(structuredDataId);

  if (!isHome) {
    existingScript?.remove();
    return;
  }

  const script = existingScript ?? document.createElement("script");
  script.id = structuredDataId;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: siteMetadata.name,
    description,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Engineering productivity toolkit",
    operatingSystem: "Any",
    url: siteMetadata.url,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  });

  if (!existingScript) {
    document.head.append(script);
  }
}

export function usePageTitle(title: string) {
  useEffect(() => {
    const metadata = pageMetadataByTitle[title] ?? {
      canonicalPath: window.location.pathname,
      documentTitle: `${title} | Freeshot`,
      description:
        "Freeshot provides practical tools for developer productivity, platform engineering and software architecture.",
    };
    const canonicalUrl = new URL(metadata.canonicalPath, siteMetadata.url).href;
    const robotsContent = metadata.noIndex
      ? "noindex, nofollow"
      : "index, follow";

    document.title = metadata.documentTitle;
    setMetaTag("name", "description", metadata.description);
    setMetaTag("name", "robots", robotsContent);
    setCanonicalUrl(canonicalUrl);

    setMetaTag("property", "og:title", metadata.documentTitle);
    setMetaTag("property", "og:description", metadata.description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:site_name", siteMetadata.name);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:image", siteMetadata.socialImageUrl);
    setMetaTag("property", "og:image:alt", "Freeshot engineering toolkit");

    setMetaTag("name", "twitter:card", "summary");
    setMetaTag("name", "twitter:title", metadata.documentTitle);
    setMetaTag("name", "twitter:description", metadata.description);
    setMetaTag("name", "twitter:image", siteMetadata.socialImageUrl);
    setMetaTag("name", "twitter:image:alt", "Freeshot engineering toolkit");

    updateHomeStructuredData(title === "Home", metadata.description);
  }, [title]);
}

import { Link } from "react-router-dom";
import { Badge } from "flowbite-react";
import { PageShell } from "../../components/common/PageShell";
import { usePageTitle } from "../../hooks/usePageTitle";
import { routePaths } from "../../utils/routes";

export function DpopNotePage() {
  usePageTitle("DPoP");

  return (
    <PageShell
      eyebrow="Architecture Notes"
      title="DPoP"
      description="A practical overview of Demonstrating Proof-of-Possession for OAuth access tokens."
    >
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge color="info">OAuth2</Badge>
          <Badge color="purple">Security</Badge>
          <Badge color="success">IAM</Badge>
        </div>
        <div className="space-y-6 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">
              What is DPoP?
            </h2>
            <p className="mt-2">
              DPoP, Demonstrating Proof-of-Possession, binds an OAuth access
              token to a client-held cryptographic key. Instead of relying only
              on a bearer token, the client proves it owns the private key when
              calling protected APIs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">
              Why it matters
            </h2>
            <p className="mt-2">
              Bearer tokens can be used by anyone who obtains them. DPoP reduces
              that risk by requiring a signed proof for each request, including
              request method, URL, timestamp, and a unique identifier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">
              How it works
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>The client creates or uses an asymmetric key pair.</li>
              <li>The authorization request includes proof of the public key.</li>
              <li>The authorization server issues a DPoP-bound access token.</li>
              <li>Each API request includes a signed DPoP proof JWT.</li>
              <li>The resource server validates the proof and token binding.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">
              Practical notes
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>DPoP is useful for public clients such as SPA and mobile apps.</li>
              <li>It is not a replacement for TLS.</li>
              <li>Clock skew and replay protection must be handled carefully.</li>
              <li>Resource servers need DPoP validation support.</li>
            </ul>
          </section>
        </div>
        <Link
          to={routePaths.architectureNotes}
          className="mt-6 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
        >
          Back to Architecture Notes
        </Link>
      </div>
    </PageShell>
  );
}

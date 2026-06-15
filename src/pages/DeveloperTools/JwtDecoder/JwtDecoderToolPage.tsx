import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Textarea } from "flowbite-react";
import { HelpTooltip } from "../../../components/common/HelpTooltip";
import { ToolToast } from "../../../components/common/ToolToast";
import { ToolPageLayout } from "../../../components/layout/ToolPageLayout";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { ToolExample } from "../../../types/toolPage";
import type { ToastMessage, ToastTone } from "../../../types/toast";
import {
  decodeJwt,
  extractRolesAndScopes,
  formatJwtDate,
  getNumericClaim,
  getStringClaim,
  getTokenStatus,
  isJwtFailure,
  type DecodedJwt,
} from "../../../utils/jwt";
import { routePaths } from "../../../utils/routes";

const examples: ToolExample[] = [
  {
    title: "JWT Structure",
    inputLabel: "Input",
    input: "header.payload.signature",
    outputLabel: "Output",
    output: "Decoded header, payload, and signature",
  },
];

const insightClaims = ["alg", "typ", "iss", "sub", "aud", "azp", "jti"];
const dateClaims = ["exp", "iat", "nbf"];

export function JwtDecoderToolPage() {
  usePageTitle("JWT Decoder");

  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const rolesAndScopes = useMemo(
    () => (decoded ? extractRolesAndScopes(decoded.payload) : []),
    [decoded],
  );

  function showToast(tone: ToastTone, text: string) {
    setToast({ id: Date.now(), tone, text });
  }

  function handleDecode() {
    const result = decodeJwt(token);

    if (isJwtFailure(result)) {
      setDecoded(null);
      setError(result.error);
      showToast("failure", "JWT decode failed.");
      return;
    }

    setDecoded(result);
    setError("");
    showToast("success", "JWT decoded.");
  }

  async function copyText(value: string, message: string) {
    if (!value) {
      showToast("info", "There is nothing to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showToast("success", message);
    } catch {
      showToast("failure", "Copy failed. Please copy manually.");
    }
  }

  function clearAll() {
    setToken("");
    setDecoded(null);
    setError("");
    showToast("info", "JWT cleared.");
  }

  const headerJson = decoded ? JSON.stringify(decoded.header, null, 2) : "";
  const payloadJson = decoded ? JSON.stringify(decoded.payload, null, 2) : "";

  return (
    <ToolPageLayout
      title="JWT Decoder"
      description="Decode JWT header and payload claims for debugging authentication, authorization, and token lifetime issues."
      breadcrumbs={[
        { label: "Developer Tools", path: routePaths.developerTools },
        { label: "JWT Decoder" },
      ]}
      overviewTitle="What is a JWT?"
      overview={
        <div className="space-y-3">
          <p>JWTs carry signed header, payload, and signature parts.</p>
          <p>
            Decoding helps inspect claims such as issuer, subject, audience,
            roles, scopes, and expiration.
          </p>
          <p>Decoding is not signature verification.</p>
        </div>
      }
      inputs={
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="jwt-input" className="text-sm font-semibold text-gray-900 dark:text-white">
                JWT Token
              </label>
              <HelpTooltip
                title="JWT Token"
                description="Paste a JWT token to decode its header, payload, and signature."
                exampleInput="eyJhbGciOi..."
                exampleOutput="Decoded claims"
              />
            </div>
            <Textarea
              id="jwt-input"
              rows={7}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste JWT token here..."
              className="font-mono"
            />
          </div>
          {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button color="blue" onClick={handleDecode}>Decode</Button>
            <Button color="light" onClick={() => void copyText(headerJson, "Header copied.")}>Copy Header</Button>
            <Button color="light" onClick={() => void copyText(payloadJson, "Payload copied.")}>Copy Payload</Button>
            <Button color="gray" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      }
      outputs={
        <div className="space-y-6">
          {decoded ? <StatusPanel status={getTokenStatus(decoded.payload)} /> : null}
          {decoded ? (
            <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">JWT Insights</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {insightClaims.map((claim) => {
                  const value = claim === "alg" || claim === "typ"
                    ? getStringClaim(decoded.header, claim)
                    : getStringClaim(decoded.payload, claim);
                  return value ? <ClaimRow key={claim} label={claim} value={value} /> : null;
                })}
              </div>
              <div className="mt-5 grid gap-3">
                {dateClaims.map((claim) => {
                  const value = getNumericClaim(decoded.payload, claim);
                  return value ? <DateClaim key={claim} label={claim} seconds={value} /> : null;
                })}
              </div>
              {rolesAndScopes.length > 0 ? (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Roles & Scopes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rolesAndScopes.map((value) => <Badge key={value} color="info">{value}</Badge>)}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
          <JsonBlock title="Header JSON" value={headerJson} />
          <JsonBlock title="Payload JSON" value={payloadJson} />
          <JsonBlock title="Signature" value={decoded?.signature ?? ""} />
        </div>
      }
      examples={examples}
      notesCollapsible
      notes={
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <li>JWT decoding does not verify the token signature.</li>
          <li>Do not paste sensitive production tokens into untrusted tools.</li>
          <li>exp, iat, and nbf are usually Unix timestamps in seconds.</li>
        </ul>
      }
      toast={<ToolToast toast={toast} />}
    />
  );
}

function StatusPanel({ status }: { status: string }) {
  const color = status === "Active" ? "success" : status === "Expired" ? "failure" : "warning";
  return <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><span className="mr-3 text-sm font-semibold text-gray-900 dark:text-white">Token Status</span><Badge color={color}>{status}</Badge></div>;
}

function ClaimRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950"><p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-gray-100">{value}</p></div>;
}

function DateClaim({ label, seconds }: { label: string; seconds: number }) {
  return <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950"><p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">UTC: {formatJwtDate(seconds, "UTC")}</p><p className="font-mono text-sm text-gray-900 dark:text-gray-100">Europe/Istanbul: {formatJwtDate(seconds, "Europe/Istanbul")}</p><p className="font-mono text-sm text-gray-900 dark:text-gray-100">Local: {formatJwtDate(seconds)}</p></div>;
}

function JsonBlock({ title, value }: { title: string; value: string }) {
  return <div><h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{title}</h2><pre className="min-h-24 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">{value || "-"}</pre></div>;
}

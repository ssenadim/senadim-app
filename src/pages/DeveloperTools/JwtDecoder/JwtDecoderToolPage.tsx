import { useEffect, useMemo, useState } from "react";
import { Badge, Button, TextInput, Textarea } from "flowbite-react";
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
  getClaimEntries,
  getNumericClaim,
  getSecurityWarnings,
  getStringClaim,
  getTokenStatus,
  isJwtFailure,
  type DecodedJwt,
  type JwtWarning,
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

const insightClaims = ["iss", "sub", "aud", "azp", "scope", "exp", "iat", "nbf", "jti"];
const headerClaims = ["alg", "typ"];
const dateClaims = ["exp", "iat", "nbf"];

export function JwtDecoderToolPage() {
  usePageTitle("JWT Decoder");

  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState("");
  const [claimSearch, setClaimSearch] = useState("");
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
  const warnings = useMemo(
    () => (decoded ? getSecurityWarnings(decoded) : []),
    [decoded],
  );
  const matchingClaims = useMemo(() => {
    if (!decoded) return [];
    const query = claimSearch.trim().toLowerCase();
    return getClaimEntries(decoded).filter((entry) =>
      `${entry.key} ${entry.value}`.toLowerCase().includes(query),
    );
  }, [claimSearch, decoded]);

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
  const decodedTokenJson = decoded
    ? JSON.stringify(
        {
          header: decoded.header,
          payload: decoded.payload,
          signature: decoded.signature,
        },
        null,
        2,
      )
    : "";

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
            <Button color="light" onClick={() => void copyText(decodedTokenJson, "Decoded token copied.")}>Copy Decoded Token</Button>
            <Button color="gray" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      }
      outputs={
        <div className="space-y-6">
          {decoded ? <StatusPanel status={getTokenStatus(decoded.payload)} /> : null}
          {decoded ? <SecurityWarnings warnings={warnings} /> : null}
          {decoded ? (
            <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">JWT Insights</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {headerClaims.map((claim) => {
                  const value = getStringClaim(decoded.header, claim);
                  return value ? <ClaimRow key={claim} label={claim} value={value} highlighted /> : null;
                })}
                {insightClaims.map((claim) => {
                  const value = getStringClaim(decoded.payload, claim);
                  return value ? <ClaimRow key={claim} label={claim} value={value} highlighted /> : null;
                })}
              </div>
              <div className="mt-5 grid gap-3">
                {dateClaims.map((claim) => {
                  const value = getNumericClaim(decoded.payload, claim);
                  return value ? <DateClaim key={claim} label={claim} seconds={value} /> : null;
                })}
              </div>
              {rolesAndScopes.length > 0 ? (
                <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/40">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Roles & Scopes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rolesAndScopes.map((value) => <Badge key={value} color="purple">{value}</Badge>)}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
          {decoded ? (
            <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Claim Search</h2>
              <TextInput
                className="mt-3"
                value={claimSearch}
                onChange={(event) => setClaimSearch(event.target.value)}
                placeholder="Search claims, values, roles, scopes..."
              />
              <div className="mt-4 grid gap-2">
                {matchingClaims.slice(0, 20).map((entry) => (
                  <ClaimRow key={entry.key} label={entry.key} value={entry.value} />
                ))}
              </div>
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

function SecurityWarnings({ warnings }: { warnings: JwtWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          No common JWT security warnings detected.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
      <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
        Security Warnings
      </h2>
      <div className="mt-3 grid gap-2">
        {warnings.map((warning) => (
          <div key={warning.title}>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              {warning.title}
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {warning.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClaimRow({
  label,
  value,
  highlighted,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return <div className={`rounded-lg p-3 ${highlighted ? "border border-cyan-200 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-950/40" : "bg-gray-50 dark:bg-gray-950"}`}><p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 break-all font-mono text-sm text-gray-900 dark:text-gray-100">{value}</p></div>;
}

function DateClaim({ label, seconds }: { label: string; seconds: number }) {
  return <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950"><p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">UTC: {formatJwtDate(seconds, "UTC")}</p><p className="font-mono text-sm text-gray-900 dark:text-gray-100">Europe/Istanbul: {formatJwtDate(seconds, "Europe/Istanbul")}</p><p className="font-mono text-sm text-gray-900 dark:text-gray-100">Local: {formatJwtDate(seconds)}</p></div>;
}

function JsonBlock({ title, value }: { title: string; value: string }) {
  return <div><h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{title}</h2><pre className="min-h-24 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">{value || "-"}</pre></div>;
}

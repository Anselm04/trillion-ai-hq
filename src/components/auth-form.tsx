import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { TrillionMark } from "@/components/trillion-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/locale";
import { isFounderEmail, rememberAdminOpen } from "@/lib/trillion/company";
import { readLastId, saveLastId, type LastId } from "@/lib/auth/last-id";

const DRAFT_KEY = "trillion-auth-draft";

type Draft = { name?: string; email?: string; password?: string; confirm?: string };

function readDraft(): Draft {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

function writeDraft(form: HTMLFormElement) {
  const fd = new FormData(form);
  try {
    window.sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        confirm: String(fd.get("confirm") ?? ""),
      }),
    );
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function ProviderMark({ id }: { id: string }) {
  if (id.includes("github")) {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.65.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.58 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
        />
      </svg>
    );
  }
  if (id.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.7 0 2.9.7 3.5 1.3l2.4-2.3C16.4 3.7 14.4 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1-.2-1.5H12Z" />
        <path fill="#34A853" d="M3.9 7.4 6.8 9.6C7.6 7.6 9.6 6.2 12 6.2c1.7 0 2.9.7 3.5 1.3l2.4-2.3C16.4 3.7 14.4 2.8 12 2.8 8.2 2.8 4.9 4.9 3.9 7.4Z" />
        <path fill="#FBBC05" d="M12 21.2c2.4 0 4.4-.8 5.8-2.1l-2.7-2.1c-.7.5-1.7.9-3.1.9-2.6 0-4.8-1.7-5.6-4.1l-2.9 2.2C5 19.1 8.2 21.2 12 21.2Z" />
        <path fill="#4285F4" d="M20.8 12.3c0-.6-.1-1-.2-1.5H12v3.6h5.1c-.2 1.1-.9 2.2-1.9 2.9l2.7 2.1c1.6-1.5 2.9-3.7 2.9-7.1Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="currentColor" d="M18.2 2H21l-6.6 7.5L22 22h-6.2l-4.8-7.3L5.6 22H2.8l7-8L2 2h6.3l4.4 6.6L18.2 2Zm-1.1 18h1.7L7 3.9H5.2L17.1 20Z" />
    </svg>
  );
}

function PhotoId({ last }: { last: LastId }) {
  const label = last.name || last.email || "you";
  if (last.image) {
    return <img src={last.image} alt="" width={44} height={44} decoding="async" className="size-11 rounded-full object-cover" />;
  }
  const initials = label
    .split(/\s+|@/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="grid size-11 place-items-center rounded-full bg-sage/20 text-sm text-sage">{initials || "T"}</span>
  );
}

export function AuthForm({
  kind,
  next,
}: {
  kind: "signin" | "signup" | "admin";
  next?: string;
}) {
  const { t } = useI18n();
  const creating = kind === "signup";
  const draft = readDraft();
  const [last, setLast] = useState<LastId | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<string | null>(null);
  const cancelOauth = useRef(false);

  const fallback = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const title = creating ? t("auth.createTitle") : t("auth.signInTitle");
  const sub = creating ? t("auth.createSub") : "One click with GitHub, Google, or X — or use email.";

  useEffect(() => {
    setLast(readLastId());
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const onInput = () => writeDraft(form);
    form.addEventListener("input", onInput);
    return () => form.removeEventListener("input", onInput);
  }, []);

  function go(emailAddr: string) {
    clearDraft();
    saveLastId({ name: null, email: emailAddr, image: null, providerId: "email" });
    if (isFounderEmail(emailAddr)) rememberAdminOpen();
    window.location.replace(isFounderEmail(emailAddr) ? "/throne" : fallback);
  }

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (!email || !password) {
      setError("Enter email and password.");
      return;
    }
    if (creating && password !== confirm) {
      setError(t("auth.mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const path = creating ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          ...(creating ? { name: name || email.split("@")[0] } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        const msg = data.message ?? "";
        if (creating && /already|exist|registered/i.test(msg)) {
          setError("This email already has an account. Use Sign in.");
        } else if (creating) {
          setError("Could not create the account.");
        } else {
          setError("Email or password is wrong.");
        }
        setBusy(false);
        return;
      }
      saveLastId({ name: name || null, email, image: null, providerId: "email" });
      go(email);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : t("auth.signIn"));
    }
  }

  async function onOauth(providerId: string) {
    setError(null);
    setOauthBusy(providerId);
    cancelOauth.current = false;
    saveLastId({
      name: last?.name ?? null,
      email: last?.email ?? null,
      image: last?.image ?? null,
      providerId,
    });
    void signIn(providerId, { callbackURL: fallback, errorCallbackURL: "/login" }).catch((err: Error) => {
      if (cancelOauth.current) return;
      setError(err.message || t("auth.oauthFail"));
      setOauthBusy(null);
    });
  }

  const oauthButtons = (
    <div className="grid gap-2">
      {GROK_PROVIDERS.map((p) => (
        <Button
          key={p.providerId}
          type="button"
          variant="outline"
          className="h-12 justify-start gap-3 px-4"
          disabled={Boolean(oauthBusy) || busy}
          onClick={() => onOauth(p.providerId)}
        >
          <ProviderMark id={p.providerId} />
          <span>
            {oauthBusy === p.providerId
              ? t("auth.oauthWait")
              : p.providerId.includes("github")
                ? "Continue with GitHub"
                : p.providerId.includes("google")
                  ? t("auth.continueGoogle")
                  : t("auth.continueX")}
          </span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto grid max-w-md gap-8 px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="flex justify-center">
          <TrillionMark size={56} />
        </div>
        <h1 className="mt-6 font-display text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{sub}</p>
      </div>
      {authEnabled ? (
        <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
          {!creating && last && (last.image || last.name || last.email) && (
            <button
              type="button"
              disabled={Boolean(oauthBusy) || busy}
              onClick={() => {
                if (last.providerId && last.providerId !== "email") onOauth(last.providerId);
                else formRef.current?.querySelector<HTMLInputElement>("#password")?.focus();
              }}
              className="mb-5 flex w-full items-center gap-3 rounded-xl border border-border px-3 py-3 text-left hover:bg-muted"
            >
              <PhotoId last={last} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  Continue as {last.name || last.email}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {last.providerId?.includes("github")
                    ? "GitHub"
                    : last.providerId?.includes("google")
                      ? "Google"
                      : last.providerId?.includes("x") || last.providerId?.includes("twitter")
                        ? "X"
                        : last.email}
                </span>
              </span>
            </button>
          )}
          {!creating && oauthButtons}
          {!creating && <p className="my-5 text-center text-xs text-faint">or email</p>}
          <form ref={formRef} className="grid gap-3" method="post" noValidate onSubmit={onEmail}>
            {creating && (
              <div className="grid gap-1.5">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input id="name" name="name" autoComplete="name" defaultValue={draft.name ?? last?.name ?? ""} />
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={draft.email ?? last?.email ?? ""}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={creating ? "new-password" : "current-password"}
                defaultValue={draft.password ?? ""}
              />
              {creating && <p className="text-xs text-faint">{t("auth.passwordHint")}</p>}
            </div>
            {creating && (
              <div className="grid gap-1.5">
                <Label htmlFor="confirm">{t("auth.confirm")}</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  defaultValue={draft.confirm ?? ""}
                />
              </div>
            )}
            {creating && (
              <p className="text-xs text-muted-foreground">
                {t("auth.agree")}{" "}
                <Link to="/terms" className="underline">
                  {t("nav.terms")}
                </Link>{" "}
                ·{" "}
                <Link to="/privacy" className="underline">
                  {t("nav.privacy")}
                </Link>
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || Boolean(oauthBusy)}>
              {busy ? t("auth.wait") : creating ? t("auth.create") : t("auth.signIn")}
            </Button>
          </form>
          {creating ? (
            <>
              <p className="my-5 text-center text-xs text-faint">or</p>
              {oauthButtons}
              <Link
                to="/login"
                className="mt-4 block w-full rounded-md border border-border py-3 text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Already have an account? Sign in
              </Link>
            </>
          ) : (
            <Link
              to="/signup"
              className="mt-4 block w-full rounded-md border border-border py-3 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              First time here? Create the account
            </Link>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
      )}
    </div>
  );
}

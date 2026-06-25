"use client";

import { TRUST_MESSAGES } from "@/lib/platform/core/trustMessages";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AvatarEmojiPicker from "@/components/auth/AvatarEmojiPicker";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import {
  getOrCreateDeviceKey,
  getRememberMePreference,
  markAppUnlocked,
  setRememberMePreference,
} from "@/lib/auth/security/deviceClient";
import {
  markDeviceHasAuthenticated,
  markSignupDismissed,
} from "@/lib/auth/signupPrompt";
import {
  CASHOUT_SETUP_PATH,
  markCashOutPromptPending,
} from "@/lib/auth/cashOutPrompt";
import { signUpPlayer } from "@/lib/auth/playerAuthClient";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { markFirstLoginWelcomePending } from "@/lib/auth/firstLoginWelcome";
import PasswordInput from "@/components/ui/PasswordInput";

type SignupStep = 1 | 2 | 3;

interface SignupWelcomeModalProps {
  open: boolean;
  onClose: () => void;
  referralCode?: string;
}

export default function SignupWelcomeModal({
  open,
  onClose,
  referralCode = "",
}: SignupWelcomeModalProps) {
  const [step, setStep] = useState<SignupStep>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState<string>(DEFAULT_AVATAR);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceKey = getOrCreateDeviceKey();

  useEffect(() => {
    if (!open) return;
    setRememberMe(getRememberMePreference());
  }, [open]);

  if (!open) return null;

  function handleBrowseOnly() {
    markSignupDismissed(deviceKey);
    onClose();
  }

  function validateStep1(): string | null {
    if (firstName.trim().length < 2) return "Enter your first name.";
    if (lastName.trim().length < 2) return "Enter your last name.";
    if (!email.includes("@")) return "Enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  function validateStep2(): string | null {
    if (!addressLine1.trim()) return "Enter your street address.";
    if (!city.trim()) return "Enter your city.";
    if (!state.trim()) return "Enter your state.";
    if (postalCode.trim().length < 4) return "Enter a valid ZIP / postal code.";
    return null;
  }

  async function handleSubmit() {
    setError(null);
    const step1Error = validateStep1();
    if (step1Error) {
      setError(step1Error);
      setStep(1);
      return;
    }
    const step2Error = validateStep2();
    if (step2Error) {
      setError(step2Error);
      setStep(2);
      return;
    }

    setLoading(true);
    setRememberMePreference(rememberMe);

    const result = await signUpPlayer({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      avatarEmoji,
      deviceKey,
      rememberMe,
      referralCode: referralCode || undefined,
    });

    setLoading(false);

    if (!result.ok) {
      setError(formatPlayerAuthError(result.error));
      return;
    }

    markDeviceHasAuthenticated(deviceKey);
    markAppUnlocked(email.trim().toLowerCase());
    markCashOutPromptPending();
    markFirstLoginWelcomePending();
    onClose();
    const separator = CASHOUT_SETUP_PATH.includes("?") ? "&" : "?";
    window.location.href = `${CASHOUT_SETUP_PATH}${separator}auth=account_created`;
  }

  return (
    <div className="signup-welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="signup-welcome-title">
      <div className="signup-welcome-modal sb-promo-scale-in">
        <button
          type="button"
          className="sb-promo-close"
          aria-label="Browse without signing up"
          onClick={handleBrowseOnly}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="signup-welcome-header">
          <p className="signup-welcome-kicker">Welcome to SquareBoards</p>
          <h2 id="signup-welcome-title" className="signup-welcome-title">
            {step === 1 ? "Create your account" : step === 2 ? "Your address" : "Pick your emoji"}
          </h2>
          <p className="signup-welcome-subtitle">
            {step === 1
              ? "Set up a free player profile — then connect a cash-out account (about 2 min) so you can buy squares and receive winnings."
              : step === 2
                ? "Used for payouts and account verification when you win."
                : "Your avatar shows on leaderboards and your player card."}
          </p>
          <div className="signup-welcome-steps" aria-hidden>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={[
                  "signup-welcome-step-dot",
                  step >= n ? "signup-welcome-step-dot-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
        </div>

        <div className="signup-welcome-body">
          {step === 1 ? (
            <div className="signup-welcome-fields">
              <div className="signup-welcome-row">
                <div>
                  <label htmlFor="signup-first-name" className="signup-welcome-label">
                    First name
                  </label>
                  <input
                    id="signup-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="player-input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-last-name" className="signup-welcome-label">
                    Last name
                  </label>
                  <input
                    id="signup-last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="player-input w-full"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-email" className="signup-welcome-label">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="player-input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="signup-welcome-label">
                  Password
                </label>
                <PasswordInput
                  id="signup-password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="signup-confirm-password" className="signup-welcome-label">
                  Confirm password
                </label>
                <PasswordInput
                  id="signup-confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  minLength={8}
                  required
                  disabled={loading}
                />
              </div>
              <div className="signup-cashout-callout">
                <p>
                  <strong>After sign-up:</strong> you&apos;ll connect a free Stripe cash-out profile
                  (~2 minutes). Required to purchase squares and receive winnings — we&apos;ll walk
                  you through it right away.
                </p>
                <p className="mt-2 text-emerald-300/90">{TRUST_MESSAGES.cashOutDebitTip}</p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="signup-welcome-fields">
              <div>
                <label htmlFor="signup-address1" className="signup-welcome-label">
                  Street address
                </label>
                <input
                  id="signup-address1"
                  type="text"
                  autoComplete="address-line1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="player-input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-address2" className="signup-welcome-label">
                  Apt / suite (optional)
                </label>
                <input
                  id="signup-address2"
                  type="text"
                  autoComplete="address-line2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="player-input w-full"
                />
              </div>
              <div className="signup-welcome-row signup-welcome-row-3">
                <div>
                  <label htmlFor="signup-city" className="signup-welcome-label">
                    City
                  </label>
                  <input
                    id="signup-city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="player-input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-state" className="signup-welcome-label">
                    State
                  </label>
                  <input
                    id="signup-state"
                    type="text"
                    autoComplete="address-level1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="player-input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-zip" className="signup-welcome-label">
                    ZIP
                  </label>
                  <input
                    id="signup-zip"
                    type="text"
                    autoComplete="postal-code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="player-input w-full"
                    required
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="signup-welcome-fields">
              <AvatarEmojiPicker value={avatarEmoji} onChange={setAvatarEmoji} disabled={loading} />
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-sb-muted leading-relaxed">
                  <span className="text-white font-medium">Keep me signed in</span>
                  <br />
                  Secure session on this device — set up Face ID / fingerprint after sign-up in Security.
                </span>
              </label>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
              {error}
            </p>
          ) : null}
        </div>

        <div className="signup-welcome-footer">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => setStep((step - 1) as SignupStep)}
            >
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" disabled={loading} onClick={handleBrowseOnly}>
              Browse without account
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              className="player-btn-glow"
              onClick={() => {
                setError(null);
                if (step === 1) {
                  const err = validateStep1();
                  if (err) {
                    setError(err);
                    return;
                  }
                }
                if (step === 2) {
                  const err = validateStep2();
                  if (err) {
                    setError(err);
                    return;
                  }
                }
                setStep((step + 1) as SignupStep);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="player-btn-glow"
              disabled={loading}
              onClick={() => void handleSubmit()}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

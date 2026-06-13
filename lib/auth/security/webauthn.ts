import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import {
  getWebAuthnOrigin,
  getWebAuthnRpId,
  getWebAuthnRpName,
} from "@/lib/auth/security/webauthnConfig";
import {
  getWebAuthnCredential,
  listWebAuthnCredentialsForEmail,
  saveWebAuthnCredential,
  updateWebAuthnCounter,
} from "@/lib/auth/security/db";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const challenges = new Map<string, { challenge: string; email: string; deviceKey: string; expires: number }>();

function challengeKey(email: string, deviceKey: string, kind: "register" | "auth") {
  return `${kind}:${email}:${deviceKey}`;
}

function setChallenge(key: string, challenge: string, email: string, deviceKey: string) {
  challenges.set(key, {
    challenge,
    email,
    deviceKey,
    expires: Date.now() + CHALLENGE_TTL_MS,
  });
}

function takeChallenge(key: string) {
  const entry = challenges.get(key);
  if (!entry || entry.expires < Date.now()) {
    challenges.delete(key);
    return null;
  }
  challenges.delete(key);
  return entry;
}

export async function createRegistrationOptions(input: {
  email: string;
  deviceKey: string;
  deviceName: string;
}) {
  const existing = await listWebAuthnCredentialsForEmail(input.email);

  const options = await generateRegistrationOptions({
    rpName: getWebAuthnRpName(),
    rpID: getWebAuthnRpId(),
    userName: input.email,
    userDisplayName: input.deviceName,
    userID: new TextEncoder().encode(input.email),
    attestationType: "none",
    excludeCredentials: existing.map((cred) => ({
      id: cred.credentialId,
      transports: cred.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
  });

  setChallenge(challengeKey(input.email, input.deviceKey, "register"), options.challenge, input.email, input.deviceKey);
  return options;
}

export async function verifyRegistration(input: {
  email: string;
  deviceKey: string;
  response: RegistrationResponseJSON;
}) {
  const stored = takeChallenge(challengeKey(input.email, input.deviceKey, "register"));
  if (!stored) throw new Error("Registration challenge expired. Try again.");

  const verification = await verifyRegistrationResponse({
    response: input.response,
    expectedChallenge: stored.challenge,
    expectedOrigin: getWebAuthnOrigin(),
    expectedRPID: getWebAuthnRpId(),
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Biometric registration could not be verified.");
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  await saveWebAuthnCredential({
    email: input.email,
    deviceKey: input.deviceKey,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports ?? [],
  });

  return {
    verified: true,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
  };
}

export async function createAuthenticationOptions(input: { email: string; deviceKey: string }) {
  const credentials = await listWebAuthnCredentialsForEmail(input.email);
  const deviceCredentials = credentials.filter((c) => c.deviceKey === input.deviceKey);
  const pool = deviceCredentials.length ? deviceCredentials : credentials;

  if (!pool.length) {
    throw new Error("No biometric login is set up for this account.");
  }

  const options = await generateAuthenticationOptions({
    rpID: getWebAuthnRpId(),
    allowCredentials: pool.map((cred) => ({
      id: cred.credentialId,
      transports: cred.transports as AuthenticatorTransportFuture[],
    })),
    userVerification: "required",
  });

  setChallenge(challengeKey(input.email, input.deviceKey, "auth"), options.challenge, input.email, input.deviceKey);
  return options;
}

export async function verifyAuthentication(input: {
  email: string;
  deviceKey: string;
  response: AuthenticationResponseJSON;
}) {
  const stored = takeChallenge(challengeKey(input.email, input.deviceKey, "auth"));
  if (!stored) throw new Error("Sign-in challenge expired. Try again.");

  const credential = await getWebAuthnCredential(input.response.id);
  if (!credential || credential.email !== input.email.toLowerCase()) {
    throw new Error("Unknown biometric credential.");
  }

  const verification = await verifyAuthenticationResponse({
    response: input.response,
    expectedChallenge: stored.challenge,
    expectedOrigin: getWebAuthnOrigin(),
    expectedRPID: getWebAuthnRpId(),
    requireUserVerification: true,
    credential: {
      id: credential.credentialId,
      publicKey: Buffer.from(credential.publicKey, "base64url"),
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransportFuture[],
    },
  });

  if (!verification.verified) {
    throw new Error("Biometric sign-in could not be verified.");
  }

  await updateWebAuthnCounter(credential.credentialId, verification.authenticationInfo.newCounter);
  return { email: credential.email, verified: true };
}

export async function emailHasPasskey(email: string): Promise<boolean> {
  const credentials = await listWebAuthnCredentialsForEmail(email);
  return credentials.length > 0;
}

export async function deviceHasPasskey(email: string, deviceKey: string): Promise<boolean> {
  const credentials = await listWebAuthnCredentialsForEmail(email);
  return credentials.some((c) => c.deviceKey === deviceKey);
}

// Biometric Authentication Handler (WebAuthn + Simulated Sensor Support)

export interface BiometricAuthResult {
  success: boolean;
  type: 'webauthn' | 'simulated' | 'fallback_pin';
  error?: string;
}

export async function checkBiometricsAvailability(): Promise<{
  available: boolean;
  hasPlatformAuthenticator: boolean;
}> {
  if (typeof window === 'undefined') {
    return { available: false, hasPlatformAuthenticator: false };
  }

  const hasCred = Boolean(window.PublicKeyCredential);
  let hasPlatform = false;

  if (hasCred && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      hasPlatform = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      hasPlatform = false;
    }
  }

  return {
    available: hasCred || true, // We always provide the simulated TouchID/FaceID sensor fallback!
    hasPlatformAuthenticator: hasPlatform,
  };
}

export async function requestWebAuthnBiometrics(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Try a lightweight credential assertion
    const options: CredentialRequestOptions = {
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'preferred',
        rpId: window.location.hostname,
        allowCredentials: [],
      },
    };

    // If platform authenticator exists, this invokes the system biometric prompt (TouchID/FaceID/Windows Hello)
    await navigator.credentials.get(options);
    return true;
  } catch {
    // If WebAuthn fails, cancelled, or no credentials enrolled, return false to let simulated interactive sensor handle it smoothly
    return false;
  }
}

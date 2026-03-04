/**
 * nonceService.ts
 *
 * Generates the x-nonce-id header required by the backend API.
 * Mirrors panda-web's secret-service.ts generateNonce() function exactly.
 *
 * The nonce is a short-lived HS256-signed JWT containing:
 *   { payload: { nonce_id: uuid }, subject: "nonce", iat, exp }
 *
 * Uses the Web Crypto API (SubtleCrypto) and TextEncoder available in
 * React Native's Hermes engine at runtime.
 * The `declare const` stubs below tell TypeScript these globals exist.
 */

// Hermes runtime globals that TypeScript doesn't know about
declare const TextEncoder: {
    new(): { encode(str: string): Uint8Array };
};

// NONCE_SECRET fetched from AWS Secrets Manager (auth/dev/v1/keys/nonce)
const NONCE_SECRET = 'sc+hrY0QeEHY+W0eFLmZGUFz7nP9vEQpD4Nn1WOfCEE=';

/** Base64url encode a Uint8Array (no padding). */
function base64urlEncode(data: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < data.byteLength; i++) {
        binary += String.fromCharCode(data[i]);
    }
    // btoa is a global available in Hermes
    return (global as any).btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/** Encode a string to Uint8Array */
function enc(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

/** Generate a crypto-random UUID (v4). */
function randomUUID(): string {
    const bytes = new Uint8Array(16);
    // crypto.getRandomValues is available in Hermes
    (global as any).crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generates the x-nonce-id header value (HS256 JWT).
 * Short-lived (120s); a fresh nonce is generated per request.
 */
export async function generateNonce(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        payload: { nonce_id: randomUUID() },
        subject: 'nonce',
        iat: now,
        exp: now + 120,
    };

    const headerB64 = base64urlEncode(enc(JSON.stringify(header)));
    const payloadB64 = base64urlEncode(enc(JSON.stringify(payload)));
    const signingInput = `${headerB64}.${payloadB64}`;

    // crypto.subtle is available in Hermes
    const subtleCrypto = (global as any).crypto.subtle;
    const key = await subtleCrypto.importKey(
        'raw',
        enc(NONCE_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await subtleCrypto.sign('HMAC', key, enc(signingInput));
    const signatureB64 = base64urlEncode(new Uint8Array(signature));

    return `${signingInput}.${signatureB64}`;
}

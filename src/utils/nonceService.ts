/// <reference lib="dom" />
/**
 * nonceService.ts
 *
 * Generates x-nonce-id JWT header required by the PandaMoney backend.
 * Mirrors panda-web generateNonce() — HS256 JWT signed with the NONCE_SECRET.
 *
 * Self-contained: Includes pure JS SHA-256, HMAC, Base64, and UUID.
 * Zero external global dependencies (no SubtleCrypto, no TextEncoder, no btoa required).
 */

const NONCE_SECRET = 'sc+hrY0QeEHY+W0eFLmZGUFz7nP9vEQpD4Nn1WOfCEE=';

// ─── Constants ───────────────────────────────────────────────────────────────
const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

// ─── Base64 ──────────────────────────────────────────────────────────────────
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function jsBtoa(input: string): string {
    let str = input;
    let output = '';
    for (
        let block = 0, charCode, i = 0, map = b64chars;
        str.charAt(i | 0) || (map = '=', i % 1);
        output += map.charAt(63 & block >> 8 - i % 1 * 8)
    ) {
        charCode = str.charCodeAt(i += 3 / 4);
        if (charCode > 0xFF) throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        block = block << 8 | charCode;
    }
    return output;
}

function base64urlEncode(data: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < data.byteLength; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return jsBtoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// ─── SHA-256 Core ────────────────────────────────────────────────────────────
function rotr32(x: number, n: number): number {
    return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256(data: Uint8Array): Uint8Array {
    const msg = Array.from(data);
    const bitLen = msg.length * 8;
    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);

    // Append bit length as 64-bit BIG-endian
    for (let i = 7; i >= 0; i--) {
        msg.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
    }

    let [h0, h1, h2, h3, h4, h5, h6, h7] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];

    for (let i = 0; i < msg.length; i += 64) {
        const w = new Array<number>(64);
        for (let j = 0; j < 16; j++) {
            w[j] = (msg[i + j * 4] << 24) | (msg[i + j * 4 + 1] << 16) |
                (msg[i + j * 4 + 2] << 8) | msg[i + j * 4 + 3];
        }
        for (let j = 16; j < 64; j++) {
            const s0 = rotr32(w[j - 15], 7) ^ rotr32(w[j - 15], 18) ^ (w[j - 15] >>> 3);
            const s1 = rotr32(w[j - 2], 17) ^ rotr32(w[j - 2], 19) ^ (w[j - 2] >>> 10);
            w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
        }

        let [a, b, c, d, e, f, g, h] = [h0, h1, h2, h3, h4, h5, h6, h7];
        for (let j = 0; j < 64; j++) {
            const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
            const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;
            h = g; g = f; f = e; e = (d + temp1) >>> 0;
            d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    const result = new Uint8Array(32);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((v, i) => {
        result[i * 4] = (v >>> 24) & 0xff;
        result[i * 4 + 1] = (v >>> 16) & 0xff;
        result[i * 4 + 2] = (v >>> 8) & 0xff;
        result[i * 4 + 3] = v & 0xff;
    });
    return result;
}

function hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array {
    const BLOCK_SIZE = 64;
    let k = key.length > BLOCK_SIZE ? sha256(key) : key;
    const kPadded = new Uint8Array(BLOCK_SIZE);
    kPadded.set(k);

    const ipad = kPadded.map(b => b ^ 0x36);
    const opad = kPadded.map(b => b ^ 0x5c);

    const inner = new Uint8Array(ipad.length + data.length);
    inner.set(ipad); inner.set(data, ipad.length);

    const innerHash = sha256(inner);
    const outer = new Uint8Array(opad.length + innerHash.length);
    outer.set(opad); outer.set(innerHash, opad.length);

    return sha256(outer);
}

// ─── App Logic ───────────────────────────────────────────────────────────────

function strToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
    return bytes;
}

function randomUUID(): string {
    const bytes = new Uint8Array(16);
    // Use Math.random if global crypto is not available
    const cr = (globalThis as any).crypto;
    if (cr && cr.getRandomValues) {
        cr.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // v4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generates the x-nonce-id header value.
 * Fresh per request; expires in 120 seconds.
 */
export function generateNonce(): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            payload: { nonce_id: randomUUID() },
            subject: 'nonce',
            iat: now,
            exp: now + 120,
        };

        const headerB64 = base64urlEncode(strToBytes(JSON.stringify(header)));
        const payloadB64 = base64urlEncode(strToBytes(JSON.stringify(payload)));
        const signingInput = `${headerB64}.${payloadB64}`;

        const keyBytes = strToBytes(NONCE_SECRET);
        const dataBytes = strToBytes(signingInput);
        const sig = hmacSha256(keyBytes, dataBytes);

        const nonce = `${signingInput}.${base64urlEncode(sig)}`;
        return nonce;
    } catch (error) {
        console.error('[nonceService] Error generating nonce:', error);
        return '';
    }
}

import { encode as btoa } from 'base-64';

/**
 * Encodes a string to a reversed hex representation of its base64 form.
 * matching the backend logic requirement.
 */
export function encodeStringToReversedHex(input: string): string {
    if (!input || !input.trim()) {
        throw new Error('Input string cannot be empty');
    }

    // 1. Base64 Encode
    const base64Encoded = btoa(input);

    // 2. Base64 to Hex
    const hexEncoded = base64ToHex(base64Encoded);

    // 3. Reverse Hex
    return reverseString(hexEncoded);
}

function base64ToHex(base64: string): string {
    // Use a simple loop to convert the binary string (atob result) to hex
    const bin = atob_manual(base64.replace(/[ \r\n]+$/, ''));
    const hexArray: string[] = [];

    for (let i = 0; i < bin.length; i++) {
        let hex = bin.charCodeAt(i).toString(16);
        if (hex.length === 1) hex = '0' + hex;
        hexArray.push(hex);
    }

    return hexArray.join('');
}

function atob_manual(input: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input).replace(/[=]+$/, '');
    if (str.length % 4 === 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    let output = '';
    for (
        let bc = 0, bs, buffer, i = 0;
        (buffer = str.charAt(i++));
        ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer),
            bc++ % 4) ? (output += String.fromCharCode(255 & bs >> (-2 * bc & 6))) : 0
    ) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function reverseString(input: string): string {
    return input.split('').reverse().join('');
}

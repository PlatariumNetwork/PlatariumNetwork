import * as secp from '@noble/secp256k1';
import { hashMessage } from './hashMessage.js';

/**
 * Verifies a digital signature.
 *
 * @param {Object} message - The original message that was signed.
 * @param {string} signatureHex - The signature in DER (or Compact) hex format.
 * @param {string} pubKeyHex - The public key in hex format (compressed or uncompressed).
 * @returns {boolean} - Returns true if the signature is valid, false otherwise.
 */
export function verifySignature(message, signatureHex, pubKeyHex) {
  try {
    const hash = hashMessage(message);
    const signature = secp.Signature.fromDER(signatureHex);
    return signature.verify(hash, pubKeyHex);
  } catch {
    return false; // Invalid signature format or verification failed
  }
}

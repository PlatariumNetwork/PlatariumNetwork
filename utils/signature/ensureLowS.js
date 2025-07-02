import * as secp from '@noble/secp256k1';

/**
 * Ensures the signature is in canonical (low-S) form.
 * This reduces malleability by forcing the S value to be less than or equal to half the curve order.
 *
 * @param {secp.Signature} signature - The signature object to normalize.
 * @returns {secp.Signature} - The normalized signature (low-S).
 */
export function ensureLowS(signature) {
  return signature.hasHighS() ? signature.normalizeS() : signature;
}

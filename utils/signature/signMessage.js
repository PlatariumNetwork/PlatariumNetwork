import * as secp from '@noble/secp256k1';
import { hashMessage } from './hashMessage.js';
import { ensureLowS } from './ensureLowS.js';
import '../../utils/secp256k1-init.js';

/**
 * Signs a message and returns the signature components.
 *
 * @param {Uint8Array} privateKey - The private key used to sign the message.
 * @param {Object} message - The message object to be signed.
 * @returns {Object} - An object containing the signature components:
 *   - r: Hex string of the R value.
 *   - s: Hex string of the S value.
 *   - pub: Hex string of the public key (compressed).
 *   - der: Signature in DER format (hex).
 *   - signatureCompact: Compact signature format + 01 suffix (for compatibility).
 */
export function signMessage(privateKey, message) {
  // Generate a SHA-256 hash with a domain separator
  const hash = hashMessage(message);

  // Generate the raw signature
  const signatureRaw = secp.signSync(hash, privateKey, { canonical: true });

  // Ensure the signature uses a low-S value (for canonical form)
  const signature = ensureLowS(secp.Signature.fromHex(signatureRaw));

  // Derive the compressed public key from the private key
  const pubKey = secp.getPublicKey(privateKey, true);

  return {
    r: signature.r.toString(16).padStart(64, '0'),
    s: signature.s.toString(16).padStart(64, '0'),
    pub: Buffer.from(pubKey).toString('hex'),
    der: signature.toDERHex(),
    signatureCompact: signature.toCompactHex() + '01',
  };
}

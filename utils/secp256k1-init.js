import { utils } from '@noble/secp256k1';
import { createHmac } from 'crypto';

/**
 * Synchronously computes HMAC-SHA256 of multiple messages using the given key.
 *
 * This function overrides the default `hmacSha256Sync` utility in noble/secp256k1
 * to use Node.js's native crypto module for HMAC calculation.
 *
 * @param {Uint8Array} key - The HMAC secret key.
 * @param {...Uint8Array} msgs - One or more message parts to be concatenated and hashed.
 * @returns {Uint8Array} - The resulting HMAC-SHA256 digest as a byte array.
 */
utils.hmacSha256Sync = (key, ...msgs) => {
  // Create HMAC instance using SHA-256 and the given key
  const h = createHmac('sha256', key);

  // Update HMAC with each message chunk
  for (const msg of msgs) {
    h.update(msg);
  }

  // Finalize and return the HMAC digest
  return h.digest();
};

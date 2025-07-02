import { createHash } from 'crypto';

/**
 * Returns the SHA-256 hash of the message with a domain separator.
 *
 * This ensures that the message hash is unique to the application context
 * and prevents replay attacks across different protocols.
 *
 * @param {Object} message - The message object to hash.
 * @returns {string} - The resulting hex-encoded SHA-256 hash.
 */
export function hashMessage(message) {
  const domainSeparator = 'PlatariumSignature:';
  return createHash('sha256')
    .update(domainSeparator + JSON.stringify(message))
    .digest('hex');
}

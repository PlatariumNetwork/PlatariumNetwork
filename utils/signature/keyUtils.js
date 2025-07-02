import { mnemonicToSeedSync } from 'bip39';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

/**
 * Generates a master seed from a mnemonic phrase.
 *
 * @param {string} mnemonic - The BIP39 mnemonic phrase.
 * @returns {Buffer} - The master seed derived from the mnemonic.
 */
export function generateMasterSeed(mnemonic) {
  return mnemonicToSeedSync(mnemonic);
}

/**
 * Derives a 32-byte private key using HKDF with the given info string.
 *
 * @param {Buffer} seed - The input seed from which to derive the key.
 * @param {string} [info='Platarium-HKDF'] - Contextual info for the HKDF derivation.
 * @returns {Uint8Array} - A 32-byte derived private key.
 */
export function deriveHkdfKey(seed, info = 'Platarium-HKDF') {
  return hkdf(sha256, seed, '', info, 32);
}

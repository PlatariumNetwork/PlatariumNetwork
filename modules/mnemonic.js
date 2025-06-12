// modules/mnemonic.js
import bip39 from 'bip39';
import crypto from 'crypto';
import { logError } from '../setting/logger.js';

export const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateMnemonic() {
  try {
    const mnemonic = bip39.generateMnemonic(256);

    const length = 12;
    const randomBytes = crypto.randomBytes(length);
    const alphanumericPart = Array.from(randomBytes).map(byte => {
      const index = byte % characterSet.length;
      return characterSet.charAt(index);
    }).join('');

    return {
      mnemonic,
      alphanumericPart
    };
  } catch (error) {
    logError('Mnemonic generation error', error);
    throw error;
  }
}

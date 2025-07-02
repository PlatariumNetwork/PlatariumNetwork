// modules/keyGenerator.js
import bip39 from 'bip39';
import hdkey from 'hdkey';
import pkg from 'elliptic';
const { ec: EC } = pkg;
import crypto from 'crypto';
import { generateMnemonic, characterSet } from './mnemonic.js';
import { logError, logInfo } from '../setting/logger.js';
import { HKDF_SALT, HKDF_INFO } from '../config/cryptoConstants.js';
import { verifyCorrelation } from '../utils/verifyCorrelation.js';
import hkdf from 'futoin-hkdf';

const ec = new EC('secp256k1');

/** 
 * Custom error for parameter validation
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** 
 * Converts BN.js object (from bn.js library) to 64-character hex string with padding
 * @param {BN} bn 
 * @returns {string}
 */
export function bnToHex32(bn) {
  let hex = bn.toString(16);
  if (hex.length > 64) throw new ValidationError('BN length is greater than 32 bytes');
  return hex.padStart(64, '0');
}

/** 
 * Generates a random alphanumeric string of given length
 * @param {number} length 
 * @param {string} [charSet] - character set
 * @returns {string}
 */
export function generateAlphanumericPart(length = 10, charSet = characterSet) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new ValidationError('length must be a positive integer');
  }
  if (typeof charSet !== 'string' || charSet.length === 0) {
    throw new ValidationError('characterSet must be a non-empty string');
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, charSet.length);
    result += charSet[idx];
  }
  return result;
}

/** 
 * Outputs a 32-byte key via HKDF (RFC5869) from masterSeed
 * @param {Buffer} masterSeed
 * @param {Buffer} [salt]
 * @param {Buffer} [info]
 * @returns {Buffer}
 */
export function deriveSignatureSeedFromMasterSeed(
  masterSeed,
  salt = HKDF_SALT,
  info = HKDF_INFO
) {
  if (!Buffer.isBuffer(masterSeed) || masterSeed.length === 0) {
    throw new ValidationError('masterSeed must be a non-empty Buffer');
  }
  return hkdf(masterSeed, 32, { salt, info, hash: 'SHA-256' });
}

/** 
 * Validates BIP39 mnemonic
 * @param {string} mnemonic 
 * @returns {boolean}
 */
function validateMnemonic(mnemonic) {
  return typeof mnemonic === 'string' && bip39.validateMnemonic(mnemonic);
}

/**
 * Key generation class (BIP32 + HKDF)
 */
export class KeyGenerator {
  /**
   * @param {number} seedIndex - BIP44 index (0 ≤ seedIndex < 2^31 -1)
   * @param {Buffer} [hkdfSalt]
   * @param {Buffer} [hkdfInfo]
   * @param {string} [customPath] - Custom derivation path (e.g. "m/44'/60'/1'/20")
   */
  constructor(seedIndex = 0, hkdfSalt = HKDF_SALT, hkdfInfo = HKDF_INFO, customPath = null) {
    const MAX_INDEX = 2 ** 31 - 1;
    if (!Number.isInteger(seedIndex) || seedIndex < 0 || seedIndex >= MAX_INDEX) {
      throw new ValidationError(`seedIndex must be an integer in the range [0, ${MAX_INDEX - 1}]`);
    }
    if (!Buffer.isBuffer(hkdfSalt) || hkdfSalt.length === 0) {
      throw new ValidationError('hkdfSalt must be a non-empty Buffer');
    }
    if (!Buffer.isBuffer(hkdfInfo) || hkdfInfo.length === 0) {
      throw new ValidationError('hkdfInfo must be a non-empty Buffer');
    }
    if (customPath !== null && typeof customPath !== 'string') {
      throw new ValidationError('customPath must be a string or null');
    }

    this.seedIndex = seedIndex;
    this.hkdfSalt = hkdfSalt;
    this.hkdfInfo = hkdfInfo;
    this.customPath = customPath;
  }

  /**
   * Generates mnemonic, masterSeed, keys (BIP32 + HKDF)
   * @returns {Object}
   */
  generateKeys() {
    try {
      const { mnemonic } = generateMnemonic();
      if (!validateMnemonic(mnemonic)) {
        throw new ValidationError('Generated mnemonic is not valid according to BIP39');
      }

      const alphanumericPart = generateAlphanumericPart(10);
      const result = this._buildKeysFromSeed(mnemonic, alphanumericPart, this.seedIndex, this.customPath);

      if (process.env.NODE_ENV !== 'production') {
        logInfo('KeyGenerator.generateKeys', {
          message: 'Successful key generation',
          seedIndex: this.seedIndex,
          time: new Date().toISOString(),
        });
      }

      return result;
    } catch (error) {
      logError('KeyGenerator.generateKeys error', {
        message: error.message,
        stack: error.stack,
        method: 'generateKeys',
        seedIndex: this.seedIndex,
        time: new Date().toISOString(),
      });
      throw error;
    }
  }

  restoreKeys(mnemonic, alphanumericPart, seedIndex = this.seedIndex, customPath = this.customPath) {
    if (!validateMnemonic(mnemonic)) {
      throw new ValidationError('Provided mnemonic is not valid according to BIP39');
    }

    return this._buildKeysFromSeed(mnemonic, alphanumericPart, seedIndex, customPath);
  }

  _buildKeysFromSeed(mnemonic, alphanumericPart, seedIndex, customPath) {
    const masterSeed = bip39.mnemonicToSeedSync(mnemonic, alphanumericPart);
    const root = hdkey.fromMasterSeed(masterSeed);
    const mainPath = customPath || `m/44'/60'/0'/0/${seedIndex}`;
    const mainNode = root.derive(mainPath);

    if (!mainNode.privateKey) {
      throw new Error('Private key is missing in mainNode');
    }

    const privateKeyHex = mainNode.privateKey.toString('hex').padStart(64, '0');
    const signatureSeed = deriveSignatureSeedFromMasterSeed(masterSeed, this.hkdfSalt, this.hkdfInfo);
    const signatureKey = ec.keyFromPrivate(signatureSeed);
    const signaturePrivateKeyHex = bnToHex32(signatureKey.getPrivate());
    const publicKeyHex = ec.keyFromPrivate(mainNode.privateKey).getPublic(true, 'hex');

    const isValid = verifyCorrelation(
      privateKeyHex,
      signaturePrivateKeyHex,
      masterSeed,
      this.hkdfSalt,
      this.hkdfInfo
    );
    if (!isValid) {
      throw new ValidationError('Key correlation verification failed');
    }

    masterSeed.fill(0);
    signatureSeed.fill(0);
    mainNode.privateKey.fill(0);

    return {
      mnemonic,
      alphanumericPart,
      derivationPaths: {
        mainPath,
        signaturePath: 'HKDF-derived',
      },
      publicKey: `Px${publicKeyHex}`,
      privateKey: `PSx${privateKeyHex}`,
      signatureKey: `Sx${signaturePrivateKeyHex}`,
    };
  }
}


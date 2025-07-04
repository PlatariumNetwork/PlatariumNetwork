// utils/verifyCorrelation.js
import { deriveSignatureSeedFromMasterSeed, bnToHex32 } from '../modules/keyGenerator.js';
import { logError, logInfo, ValidationError } from '../setting/logger.js';
import pkg from 'elliptic';
const { ec: EC } = pkg;

// Create EC instance for the secp256k1 curve
const ec = new EC('secp256k1');

export function verifyCorrelation(privateKeyHex, signatureKeyHex, masterSeed, hkdfSalt = 'defaultSalt', hkdfInfo = 'defaultInfo') {
  try {
    if (!Buffer.isBuffer(masterSeed) || masterSeed.length === 0) {
      throw new ValidationError('masterSeed must be a non-empty Buffer');
    }

    // Logging for key verification
    console.log('Private Key Hex Length:', privateKeyHex.length);
    console.log('Signature Key Hex Length:', signatureKeyHex.length);
    console.log('Private Key Hex:', privateKeyHex);
    console.log('Signature Key Hex:', signatureKeyHex);

    if (
      typeof privateKeyHex !== 'string' ||
      typeof signatureKeyHex !== 'string' ||
      privateKeyHex.length !== 64 ||
      signatureKeyHex.length !== 64
    ) {
      throw new ValidationError('Invalid format of private keys for verification');
    }

    const signatureSeed = deriveSignatureSeedFromMasterSeed(masterSeed, hkdfSalt, hkdfInfo);

    // Logging for signatureSeed verification
    console.log('Signature Seed:', signatureSeed);

    const derivedSigHex = bnToHex32(ec.keyFromPrivate(signatureSeed).getPrivate());

    // Logging to verify the generated private key
    console.log('Derived Private Key Hex:', derivedSigHex);

    const isMatch = derivedSigHex.toLowerCase() === signatureKeyHex.toLowerCase();

    signatureSeed.fill(0);

    logInfo(`verifyCorrelation: correlation check result = ${isMatch}`);

    return isMatch;

  } catch (err) {
    logError(`verifyCorrelation error: ${err.message}`);
    throw err;
  }
}


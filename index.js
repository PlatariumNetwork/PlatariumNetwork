// index.js

// Export the key generator and utilities from modules/keyGenerator.js
export { 
  KeyGenerator, 
  deriveSignatureSeedFromMasterSeed, 
  bnToHex32, 
  generateAlphanumericPart 
} from './modules/keyGenerator.js';

// Export functions from modules/mnemonic.js
export { generateMnemonic, characterSet } from './modules/mnemonic.js';

// Export the verifyCorrelation function from utils/verifyCorrelation.js
export { verifyCorrelation } from './utils/verifyCorrelation.js';

// For example from setting/logger.js, if needed
export { logError, logInfo, ValidationError } from './setting/logger.js';

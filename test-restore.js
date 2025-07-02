import { KeyGenerator } from './modules/keyGenerator.js';
import { logError } from './setting/logger.js';

(async () => {
  try {
    //  Read mnemonics and alphanumericPart from command line arguments
    const mnemonic = process.argv[2];         // 1st argument after the file name
    const alphanumericPart = process.argv[3]; // 2nd argument

    if (!mnemonic || !alphanumericPart) {
      throw new Error('Please pass the mnemonic and alphanumericPart as command line arguments');
    }

    const keyGen = new KeyGenerator();

    // Recovering keys manually
    const restoredKeys = keyGen.restoreKeys(
      mnemonic,
      alphanumericPart,
      keyGen.seedIndex,
      keyGen.customPath
    );

    console.log('Recovered keys:', restoredKeys);

  } catch (error) {
    logError('testKeyRestore error', {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString(),
    });
  }
})();

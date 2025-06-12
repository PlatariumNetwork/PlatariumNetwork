// testWallet.js
import BN from 'bn.js';
import { expect } from 'chai';
import { KeyGenerator, bnToHex32, generateAlphanumericPart } from './modules/keyGenerator.js';
import { verifyCorrelation } from './utils/verifyCorrelation.js';
import bip39 from 'bip39';

describe('KeyGenerator', function() {
  this.timeout(5000);

  let keyGen;

  beforeEach(() => {
    keyGen = new KeyGenerator(0);
  });

  describe('generateAlphanumericPart', () => {
    it('should generate a string of the specified length', () => {
      const str = generateAlphanumericPart(15);
      expect(str).to.be.a('string');
      expect(str.length).to.equal(15);
    });

    it('should throw an error if the length is incorrect', () => {
      expect(() => generateAlphanumericPart(-1)).to.throw();
      expect(() => generateAlphanumericPart(0)).to.throw();
      expect(() => generateAlphanumericPart(3.14)).to.throw();
    });

    it('should throw an error if the character set is empty', () => {
      expect(() => generateAlphanumericPart(10, '')).to.throw();
    });
  });

  describe('generateKeys', () => {
    it('should correctly generate keys with valid types', () => {
      const result = keyGen.generateKeys();

      // Output to console
      console.log('Mnemonic:', result.mnemonic);
      console.log('Alphanumeric Part:', result.alphanumericPart);
      console.log('Derivation Paths:', result.derivationPaths);
      console.log('Public Key:', result.publicKey);
      console.log('Private Key:', result.privateKey);
      console.log('Signature Key:', result.signatureKey);

      expect(result).to.be.an('object');
      expect(result).to.have.all.keys('mnemonic', 'alphanumericPart', 'derivationPaths', 'publicKey', 'privateKey', 'signatureKey');

      expect(result.mnemonic).to.be.a('string');
      expect(bip39.validateMnemonic(result.mnemonic)).to.be.true;

      expect(result.alphanumericPart).to.be.a('string').and.to.have.lengthOf(10);

      expect(result.derivationPaths).to.have.property('mainPath').that.is.a('string');
      expect(result.derivationPaths).to.have.property('signaturePath').that.is.a('string');

      expect(result.publicKey).to.be.a('string').and.to.match(/^Px[0-9a-fA-F]+$/);
      expect(result.privateKey).to.be.a('string').and.to.match(/^PSx[0-9a-fA-F]{64}$/);
      expect(result.signatureKey).to.be.a('string').and.to.match(/^Sx[0-9a-fA-F]{64}$/);
    });

    it('the generated keys must be correlated (verification)', () => {
      const result = keyGen.generateKeys();

      // Extract masterSeed for verification
      const masterSeed = bip39.mnemonicToSeedSync(result.mnemonic, result.alphanumericPart);

      const privateKeyHex = result.privateKey.slice(3); // discard the PSx prefix
      const signatureKeyHex = result.signatureKey.slice(2); // discard the Sx prefix

      const isValid = verifyCorrelation(privateKeyHex, signatureKeyHex, masterSeed, keyGen.hkdfSalt, keyGen.hkdfInfo);
      expect(isValid).to.be.true;
    });

    it('should correctly handle the custom derivation path', () => {
      const customPath = "m/44'/60'/1'/0/0";
      const kg = new KeyGenerator(0, keyGen.hkdfSalt, keyGen.hkdfInfo, customPath);
      const res = kg.generateKeys();

      expect(res.derivationPaths.mainPath).to.equal(customPath);
    });
  });

  describe('restoreKeys', () => {
    it('should recover keys by mnemonic and alphanumericPart', () => {
      const generated = keyGen.generateKeys();

      const restored = keyGen.restoreKeys(
        generated.mnemonic,
        generated.alphanumericPart,
        0,
        generated.derivationPaths.mainPath
      );

      expect(restored.publicKey).to.equal(generated.publicKey);
      expect(restored.privateKey).to.equal(generated.privateKey);
      expect(restored.signatureKey).to.equal(generated.signatureKey);
    });
  });

  describe('bnToHex32', () => {
    it('should correctly convert BN to a hex string of 64 characters', () => {
      const bigNum = new BN('123456789abcdef123456789abcdef', 16);
      const hex = bnToHex32(bigNum);

      expect(hex).to.be.a('string');
      expect(hex.length).to.equal(64);
      expect(hex.endsWith(bigNum.toString(16))).to.be.true;
    });

    it('should throw an error if the length is more than 64 characters', () => {
      const tooBigNum = new BN('f'.repeat(65), 16); // 65 characters “f” in hex
      expect(() => bnToHex32(tooBigNum)).to.throw();
    });
  });
});

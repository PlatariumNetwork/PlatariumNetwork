import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import { signWithBothKeys } from './modules/signer.js';

describe('Signature Tests', function () {
  it('should generate valid signatures', function () {
    const mnemonic = 'mnemonic';
    const alphanumericPart = 'CODE';

    const payload = { data: 'Hello, Platarium!' };
    const result = signWithBothKeys(payload, mnemonic, alphanumericPart);

    assert.ok(result.hash.length === 64, 'Hash length should be 64 hex chars');
    assert.equal(result.signatures.length, 2);

    for (const sig of result.signatures) {
      assert.ok(sig.r.length > 0);
      assert.ok(sig.s.length > 0);
      assert.ok(sig.pub.length > 0);
    }
  });
});

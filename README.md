<p align="center">
  <a href="https://prevedere.platarium.com" rel="noopener">
    <img width="200px" height="200px" src="https://platarium.com/assets/prevedere/assets/images/icon/plp.png" alt="Project logo">
  </a>
</p>

<h3 align="center">Platarium Network</h3>

---

> A robust cryptographic foundation for secure decentralized applications built on the Platarium Network.

---

## 🏁 Getting Started <a name="getting_started"></a>

### 📦 Install

Clone the repository and install dependencies:

```bash
git clone https://github.com/Platarium-com/PlatariumNetwork.git
cd PlatariumNetwork
npm install
```

### 🔐 Cryptographic Modules

The project leverages powerful cryptographic tools to generate and manage secure keys, mnemonics, and identity verification:

Imported Libraries:
```bash
import bip39 from 'bip39'; // Generates BIP-39 standard mnemonic phrases (e.g., 12/24 seed words)
import hdkey from 'hdkey'; // Allows creating hierarchical deterministic wallets (BIP-32)
import pkg from 'elliptic';
const { ec: EC } = pkg; // Elliptic Curve cryptography, used for ECDSA and key derivation
import crypto from 'crypto'; // Native Node.js crypto library for secure hashing and key manipulation
import { generateMnemonic, characterSet } from './mnemonic.js'; // Custom mnemonic generator & charset
import { logError, logInfo } from '../setting/logger.js'; // Centralized logging utilities
import { HKDF_SALT, HKDF_INFO } from '../config/cryptoConstants.js'; // Constants for HKDF operations
import { verifyCorrelation } from '../utils/verifyCorrelation.js'; // Custom verification logic
import hkdf from 'futoin-hkdf'; // HKDF (HMAC-based Key Derivation Function) implementation
```

### 🧠 Key Features
* BIP-39 Mnemonic Generation
* Human-readable seed phrases to safely back up and restore wallets.
* HD Wallet Support (BIP-32)
* Support for hierarchical key derivation to generate multiple accounts from a single seed.
* ECDSA Elliptic Curve Crypto (secp256k1)
* Utilizes the same curve as Bitcoin and Ethereum for signatures and identity.
* HKDF for Key Stretching & Derivation
* Secure HMAC-based derivation with custom salts and info blocks.
* Entropy & Character Sets
* Fine-tuned control over mnemonic generation and entropy randomness.

### 🔧 Example Usage
```bash
const mnemonic = generateMnemonic(); // Generate a new mnemonic phrase
const seed = await bip39.mnemonicToSeed(mnemonic); // Convert mnemonic to seed
const root = hdkey.fromMasterSeed(seed); // Create root key
const child = root.derive("m/44'/60'/0'/0/0"); // Derive the first wallet
const privateKey = child.privateKey.toString('hex'); // Export private key
const ec = new EC('secp256k1');
const key = ec.keyFromPrivate(privateKey); // Create EC key instance
const publicKey = key.getPublic().encode('hex'); // Public key in hex
```

### 🖋 Dual-Key Signature Scheme
Platarium Network uses a dual-key signature scheme to enhance security by signing messages with two distinct private keys derived from the same mnemonic seed phrase:

## Master Seed Generation
The mnemonic phrase (24 words) is converted into a 64-byte master seed using BIP-39 standard:
```bash
mnemonic phrase (24 words)
            │
            ▼
    master seed (64 bytes)
```

## Deriving Two Private Keys
From the master seed, two different private keys are derived:

* Main Private Key:
Derived by applying HKDF to the master seed with an info string prefixed with "mainKey-" concatenated with a user-provided alphanumeric string. This produces a unique 32-byte key.
* HKDF-Derived Private Key:
Similarly derived from the same master seed, but with an info string prefixed with "hkdfKey-" plus the same alphanumeric string. This ensures cryptographic separation from the main key.
```bash
master seed
    │
    ├── HKDF(masterSeed, info="mainKey-<alphanumericPart>") → mainPrivateKey (32 bytes)
    │
    └── HKDF(masterSeed, info="hkdfKey-<alphanumericPart>") → hkdfPrivateKey (32 bytes)
```
## Signing the Message
The message object is hashed (e.g., SHA-256) to produce a fixed-length digest.

Then, this hash is signed twice:

* Once with the main private key.
* Once with the HKDF-derived private key.
```bash
message ──hashMessage()──▶ message hash
        │                      │
        ▼                      ▼
 sign with mainPrivateKey    sign with hkdfPrivateKey
        │                      │
        └──────────────┬───────┘
                       ▼
            combined signature result
```
## Result
The function returns:

* The original message,
* Its hash,
* An array of two signature objects, each containing the signature details (r, s, pub, der, signatureCompact) and the type (main or hkdf).

This dual signature system provides layered security and key diversification, improving resistance against key compromise and enhancing cryptographic guarantees for Platarium Network decentralized applications.
```bash
import { signWithBothKeys } from './signWithBothKeys.js';

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const alphanumericPart = 'user1234';
const message = { data: 'Important transaction data' };

const signed = signWithBothKeys(message, mnemonic, alphanumericPart);

console.log('Original Message:', signed.originalMessage);
console.log('Message Hash:', signed.hash);
console.log('Signatures:', signed.signatures);
```
### 🧬 Philosophy

Platarium aims to combine modern cryptographic standards with flexible, developer-friendly tooling to power scalable and secure dApps on a custom Smart Network.

### License
This project is licensed under the MIT License.

### Author
Platarium Team (support@platarium.com)
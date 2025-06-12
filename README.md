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

Clone the repository and install the dependencies:

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

### 🧬 Philosophy

Platarium aims to combine modern cryptographic standards with flexible, developer-friendly tooling to power scalable and secure dApps on a custom Smart Network.

### License
This project is licensed under the MIT License.

### Author
Platarium Team (support@platarium.com)
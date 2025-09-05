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
## 
const signed = signWithBothKeys(message, mnemonic, alphanumericPart);

console.log('Original Message:', signed.originalMessage);
console.log('Message Hash:', signed.hash);
console.log('Signatures:', signed.signatures);
```
## 🔗 Transaction Class

The **`Transaction`** class represents a signed and verifiable transfer on the Platarium Network.  
It encapsulates transaction data, hashing, fee calculation, signing, and signature validation.

### 📦 Constructor Parameters

```js
new Transaction({
  timestamp,       // Unix timestamp (ms) when transaction was created
  from,            // Sender address or identifier
  to,              // Recipient address or identifier
  value,           // Transaction amount
  previousHash,    // Link to previous transaction hash (chain reference)
  hash,            // Transaction hash (auto-calculated if not provided)
  signatures,      // Array of digital signatures (2 entries: main + hkdf)
  data,            // Optional data payload
  nonce,           // Anti-replay nonce
  coreonUnits,     // Units for fee calculation
  coreonPrice,     // Price per unit (fee rate)
  chainId,         // Network identifier
  type,            // Transaction type (default: 'transfer')
  assetType,       // Asset type (default: 'native')
  contractAddress  // Contract reference for smart contract calls
})
```

## ⚡ Core Methods
🔹 calculateFee()
Computes transaction fee:
```js
fee = coreonUnits * coreonPrice
```
🔹 calculateHash()
Generates a SHA-256 hash from all transaction fields:
```js
hash = SHA256(timestamp + from + to + value + previousHash + data + nonce + coreonUnits + coreonPrice + chainId + type + assetType + contractAddress)
```
## 🔹 async signTransaction(mnemonic, code)
*  Signs the transaction payload using the dual-key signature scheme.
* Updates the transaction’s hash.
* Stores two generated signatures (mainKey + hkdfKey) in signatures.
## 🔹 isValidSignature(mnemonic, code)
Validates that:
* Transaction contains two valid signatures.
* Transaction hash matches recalculated value.
* Signature components (r, s, pub) match expected values.
Returns:
* true if valid ✅
* false if invalid ❌
## 🔹 static fromJSON(data)
* Utility to rehydrate a transaction object from raw JSON.

## ⛓️ Blockchain Class

The `Blockchain` class manages the ledger of transactions.  
It handles initializing the chain, validating balances, signing new transactions, and saving them via `Storage`.

### Constructor

```js
new Blockchain()
Initializes an empty transaction chain (this.chain = []).
Core Methods
init()
```js
async init()
```
* Loads all saved transactions from Storage.
* Converts them into Transaction objects.
* Sorts them by timestamp.
* Initializes the chain in chronological order.

getLastTransaction()
Returns the last transaction in the chain, or null if the chain is empty.
```js
addTransaction()
```

```js
async addTransaction({
  from,
  to,
  value,
  mnemonic,
  code,
  data = '',
  nonce = 0,
  coreonUnits = 1,
  coreonPrice = 1,
  chainId = 1,
  type = 'transfer',
  assetType = 'native',
  contractAddress = null
})
```
- Creates and appends a new transaction to the chain.  

**Steps:**  
1. Gets the last transaction and links via `previousHash`.  
2. Creates a new `Transaction` instance.  
3. Calculates the transaction fee.  
4. Checks sender’s balance (throws error if insufficient).  
5. Signs the transaction using `mnemonic` and `code`.  
6. Verifies the signature.  
7. Pushes the transaction to the chain.  
8. Saves it to persistent storage.  

**Throws:**  
- `"Insufficient balance"` if sender cannot cover value + fee.  
- `"Invalid transaction signature"` if signature is invalid.  

#### getBalanceOfAddress()

```js
getBalanceOfAddress(address, assetType = 'native')
```
* Calculates the balance of a given address by iterating through the chain:
* Subtracts sent values (and fees for native asset).
* Adds received values.
* Returns the computed balance.

### 🧬 Philosophy

Platarium aims to combine modern cryptographic standards with flexible, developer-friendly tooling to power scalable and secure dApps on a custom Smart Network.

### License
This project is licensed under the MIT License.

### Author
Platarium Team (support@platarium.com)
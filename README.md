# SafleID SDK

The **SafleID SDK** is a JavaScript library designed to interact with the SafleID ecosystem. It provides functionality to validate, register, and resolve SafleIDs on blockchain networks through smart contracts and a relayer API.

---

## Features

- Validate SafleIDs against predefined rules.
- Check the registration status of SafleIDs.
- Resolve user addresses to SafleIDs and vice versa.
- Retrieve SafleID registration fees.
- Register a new SafleID using a relayer service.

---

## Installation

Install the required dependencies:

```bash
npm install @getsafle/safle-gaming-sdk
```

Add this SDK to your project:

```bash
const { SafleID } = require('@getsafle/safle-gaming-sdk');
```

---

## Usage

### Import and Initialize the SafleID SDK

```javascript
const { SafleID } = require("@getsafle/safle-gaming-sdk");

const config = {
  env: "testnet", // Options: 'testnet' or 'mainnet'
  rpcUrl: "https://your-rpc-url.com",
  mainContractAddress: "0xMainContractAddress",
  storageContractAddress: "0xStorageContractAddress",
  chainId: 1, // Ethereum Mainnet or Testnet Chain ID
  relayerUrl: "https://your-relayer-url.com",
  relayerApiKey: "your-api-key",
};

const safleID = new SafleID(config);
```

---

## Methods

### 1. **isSafleIdValid(safleId)**

Validates if the given SafleID is valid based on its length and characters.

- **Parameters:**

  - `safleId` _(string)_: SafleID to validate.

- **Returns:**
  - `true` if valid, otherwise `false`.

---

### 2. **isRegistrationPaused()**

Checks if SafleID registration is paused.

- **Returns:**
  - `true` if registration is paused, otherwise `false`.

---

### 3. **getSafleId(userAddress)**

Fetches the SafleID associated with a user's address.

- **Parameters:**

  - `userAddress` _(string)_: Ethereum address.

- **Returns:**
  - SafleID _(string)_ or an error message.

---

### 4. **getAddress(safleId)**

Fetches the Ethereum address associated with a SafleID.

- **Parameters:**

  - `safleId` _(string)_: The SafleID to resolve.

- **Returns:**
  - Ethereum address _(string)_ or a fallback value.

---

### 5. **safleIdFees()**

Fetches the SafleID registration fee.

- **Returns:**
  - Registration fee _(string)_.

---

### 6. **setSafleId(payload)**

Registers a new SafleID through the relayer.

- **Parameters:**

  - `payload` _(object)_: Contains `userAddress` and `safleId`.

- **Returns:**
  - Registration response _(object)_ or an error message.

---

## Example Usage

```javascript
(async () => {
  const safleId = "mySafleId";
  const userAddress = "0xYourEthereumAddress";

  // Check if a SafleID is valid
  const isValid = await safleID.isSafleIdValid(safleId);
  console.log(`Is SafleID valid: ${isValid}`);

  // Check registration status
  const isPaused = await safleID.isRegistrationPaused();
  console.log(`Registration Paused: ${isPaused}`);

  // Fetch the SafleID for an address
  const userSafleID = await safleID.getSafleId(userAddress);
  console.log(`User's SafleID: ${userSafleID}`);

  // Fetch the address for an SafleID
  const userAddress = await safleID.getAddress(safleId);
  console.log(`User's Address: ${userAddress}`);

  // Register a new SafleID
  const response = await safleID.setSafleId({ userAddress, safleId });
  console.log("Registration Response:", response);
})();
```

---

## Error Messages

The SDK includes predefined error messages stored in `./constants/errors.js`. These errors handle invalid inputs, paused registration, already-taken SafleIDs, and more.

---

## Notes

- Ensure the `relayerUrl` and `relayerApiKey` are configured correctly.
- Use a secure environment to store API keys and sensitive configurations.
- The `rejectUnauthorized: false` option is for testing purposes only. For production, ensure the HTTPS connection is secure.

---

## License

MIT

Feel free to contribute to the project or report issues. Happy coding! 🎉

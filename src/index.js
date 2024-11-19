const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const axios = require("axios");
const https = require("https");
const { mainContractABI } = require("./constants/ABI/main-contract");
const { storageContractABI } = require("./constants/ABI/storage-contract");
const errorMessage = require("./constants/errors");
class SafleID {
  constructor(config) {
    const {
      env,
      rpcUrl,
      mainContractAddress,
      storageContractAddress,
      chainId,
      relayerUrl,
      relayerApiKey,
    } = config;

    if (!["testnet", "mainnet"].includes(env)) {
      throw new Error(errorMessage.INVALID_ENV_INPUT);
    }

    this.web3 = new Web3(rpcUrl);
    this.mainContractAddress = mainContractAddress;
    this.storageContractAddress = storageContractAddress;
    this.chainId = chainId;
    this.relayerUrl = relayerUrl;
    this.relayerApiKey = relayerApiKey;
    this.env = env;

    // Initialize contracts
    this.MainContract = new this.web3.eth.Contract(
      mainContractABI,
      this.mainContractAddress
    );

    this.StorageContract = new this.web3.eth.Contract(
      storageContractABI,
      this.storageContractAddress
    );
  }

  async isSafleIdValid(safleId) {
    const safleIdLength = safleId.length;
    return (
      safleIdLength >= 4 &&
      safleIdLength <= 16 &&
      safleId.match(/^[0-9a-z]+$/i) !== null
    );
  }

  async isRegistrationPaused() {
    try {
      return await this.MainContract.methods.safleIdRegStatus().call();
    } catch (error) {
      throw new Error(errorMessage.INVALID_INPUT);
    }
  }

  async getSafleId(userAddress) {
    try {
      if (!this.web3.utils.isAddress(userAddress)) {
        return errorMessage.INVALID_ADDRESS;
      }

      const userSafleID = await this.StorageContract.methods
        .resolveUserAddress(userAddress)
        .call();

      if (userSafleID != "") {
        return userSafleID;
      } else {
        return "Invalid address.";
      }
    } catch (error) {
      return errorMessage.INVALID_ADDRESS;
    }
  }

  async getAddress(safleId) {
    try {
      const userAddress = await this.StorageContract.methods
        .resolveSafleId(safleId)
        .call();

      return userAddress || "0x0000000000000000000000000000000000000000";
    } catch (error) {
      return errorMessage.SAFLE_ID_NOT_REGISTERED;
    }
  }

  async safleIdFees() {
    try {
      return await this.MainContract.methods.safleIdFees().call();
    } catch (error) {
      throw new Error(errorMessage.INVALID_INPUT);
    }
  }

  async setSafleId(payload) {
    const { userAddress, safleId } = payload;

    if (!userAddress || !safleId) {
      return errorMessage.INVALID_INPUT;
    }

    if (!this.web3.utils.isAddress(userAddress)) {
      return errorMessage.INVALID_ADDRESS;
    }

    // Validation checks
    const isSafleIDRegOnHold = await this.isRegistrationPaused();
    if (isSafleIDRegOnHold) {
      return errorMessage.SAFLEID_REG_ON_HOLD;
    }

    const isAddressTaken = await this.getSafleId(userAddress);
    if (isAddressTaken !== "Invalid address.") {
      return errorMessage.ADDRESS_ALREADY_TAKEN;
    }

    const addressOfSafleId = await this.getAddress(safleId);
    if (addressOfSafleId !== "This SafleID is not registered.") {
      return errorMessage.SAFLEID_ALREADY_TAKEN;
    }

    const isSafleIDValid = await this.isSafleIdValid(safleId);
    if (!isSafleIDValid) {
      return errorMessage.INVALID_SAFLEID;
    }

    try {
      const agent = new https.Agent({
        rejectUnauthorized: false, // WARNING: This should only be used for testing
      });

      axios.defaults.httpsAgent = agent;
      const response = await axios({
        method: "post",
        url: this.relayerUrl,
        headers: {
          Authorization: `Bearer ${this.relayerApiKey}`,
          "Content-Type": "application/json",
        },
        data: {
          safleId,
          userAddress,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Relayer error:", error);
      return {
        error: true,
        message: errorMessage.INVALID_INPUT,
      };
    }
  }
}

module.exports = { SafleID };

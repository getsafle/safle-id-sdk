const { SafleID } = require("./src/index");

describe("SafleID Integration Tests", () => {
  let safleId;
  const config = {
    env: "testnet",
    rpcUrl: "https://rpc.cardona.zkevm-rpc.com",
    mainContractAddress: "0xf84BF12149Da39Fa83f97cF7def894251d1aB6cc",
    storageContractAddress: "0xC7B024F87FfD7118BDCE4018F4E6B6802520C122",
    chainId: "2442",
    relayerUrl: "https://dev-relayer-queue-gaming.safle.com/set-safleid",
    relayerApiKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imh1c2llbiIsImlhdCI6MTUxNjIzOTAyMn0.I6C9sJ9JD1j21td45PwLKMyJTqbhaefFSfcYcTN2GWQ",
  };

  beforeAll(() => {
    safleId = new SafleID(config);
  });

  describe("Contract Interactions", () => {
    test("should check registration status", async () => {
      const status = await safleId.isRegistrationPaused();
      expect(typeof status).toBe("boolean");
    });

    test("should get SafleID fees", async () => {
      const fees = await safleId.safleIdFees();
      expect(fees).toBeDefined();
      expect(typeof fees).toBe("string"); // Web3 returns big numbers as strings
    });
  });

  describe("SafleID Validation", () => {
    test("should validate correct SafleID format", async () => {
      const validIds = ["test123", "user123", "safle123"];
      for (const id of validIds) {
        const result = await safleId.isSafleIdValid(id);
        expect(result).toBe(true);
      }
    });

    test("should reject invalid SafleID format", async () => {
      const invalidIds = ["te@st", "user!123", "test_user"];
      for (const id of invalidIds) {
        const result = await safleId.isSafleIdValid(id);
        expect(result).toBe(false);
      }
    });

    test("should reject too short SafleID", async () => {
      const result = await safleId.isSafleIdValid("abc");
      expect(result).toBe(false);
    });

    test("should reject too long SafleID", async () => {
      const result = await safleId.isSafleIdValid("abcdefghijklmnopq");
      expect(result).toBe(false);
    });
  });

  describe("Address Resolution", () => {
    test("should handle valid address lookup", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const result = await safleId.getSafleId(address);
      // The result could be either a SafleID or "Invalid address." depending on registration status
      expect(typeof result).toBe("string");
    });

    test("should handle invalid address format", async () => {
      const invalidAddress = "0xinvalid";
      const result = await safleId.getSafleId(invalidAddress);
      expect(result).toBe("Invalid address.");
    });
  });

  describe("SafleID Resolution", () => {
    test("should resolve non-existent SafleID", async () => {
      const nonExistentId = "nonexistentid123";
      const result = await safleId.getAddress(nonExistentId);
      expect(result).toBe("This SafleID is not registered.");
    });

    // If you have a known registered SafleID, you can test it like this:
    test("should resolve known SafleID", async () => {
      const knownId = "lastofus1";
      const result = await safleId.getAddress(knownId);
      expect(result).toBe("0x0FeC59251E02FDFfec93F38c46d14fd0f30B8F56");
    });
  });

  describe("SafleID Registration", () => {
    test("should validate registration payload", async () => {
      const result = await safleId.setSafleId({});
      expect(result).toBe("Please check the input.");
    });

    test("should validate address format in registration", async () => {
      const result = await safleId.setSafleId({
        userAddress: "0xinvalid",
        safleId: "validid123",
      });
      expect(result).toBe("Invalid address.");
    });

    // Note: Be careful with this test as it involves actual registration
    test("should attempt new registration", async () => {
      const result = await safleId.setSafleId({
        userAddress: "0x82961fA6fBF7B6043C06e943cD683B00c6F75D0c",
        safleId: "montecarlosher",
      });
      expect(result).toBeDefined();
    });
  });
});

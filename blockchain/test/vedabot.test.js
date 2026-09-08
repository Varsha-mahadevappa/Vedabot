const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

function sha256Bytes32(text) {
  return "0x" + crypto.createHash("sha256").update(text).digest("hex");
}

describe("VedaBot Contracts", function () {
  let owner, validator, contributor, stranger;
  let vedaToken, vedaKnowledge, responseLog;

  beforeEach(async function () {
    [owner, validator, contributor, stranger] = await ethers.getSigners();

    const VedaToken = await ethers.getContractFactory("VedaToken");
    vedaToken = await VedaToken.deploy();

    const VedaKnowledge = await ethers.getContractFactory("VedaKnowledge");
    vedaKnowledge = await VedaKnowledge.deploy();

    const ResponseLog = await ethers.getContractFactory("ResponseLog");
    responseLog = await ResponseLog.deploy();

    await vedaToken.setMinter(await vedaKnowledge.getAddress());
  });

  // ─── VedaKnowledge Tests ────────────────────────────────────────────────────

  describe("VedaKnowledge", function () {
    it("should register a source with sufficient stake", async function () {
      const hash = sha256Bytes32("Bhagavad Gita");
      const minStake = await vedaKnowledge.minStake();

      await expect(
        vedaKnowledge.connect(contributor).registerSource(hash, "Bhagavad Gita", "", { value: minStake })
      ).to.emit(vedaKnowledge, "SourceRegistered");

      expect(await vedaKnowledge.totalSources()).to.equal(1);
    });

    it("should reject registration with insufficient stake", async function () {
      const hash = sha256Bytes32("Rigveda");
      await expect(
        vedaKnowledge.connect(contributor).registerSource(hash, "Rigveda", "", { value: 0 })
      ).to.be.revertedWith("VedaKnowledge: insufficient stake");
    });

    it("should not register duplicate source", async function () {
      const hash = sha256Bytes32("Upanishads");
      const minStake = await vedaKnowledge.minStake();
      await vedaKnowledge.connect(contributor).registerSource(hash, "Upanishads", "", { value: minStake });

      await expect(
        vedaKnowledge.connect(contributor).registerSource(hash, "Upanishads Again", "", { value: minStake })
      ).to.be.revertedWith("VedaKnowledge: source already registered");
    });

    it("should verify a source (owner/validator only)", async function () {
      const hash = sha256Bytes32("Yoga Sutras");
      const minStake = await vedaKnowledge.minStake();
      await vedaKnowledge.connect(contributor).registerSource(hash, "Yoga Sutras", "", { value: minStake });

      expect(await vedaKnowledge.isVerified(hash)).to.be.false;

      await vedaKnowledge.connect(owner).verifySource(hash);
      expect(await vedaKnowledge.isVerified(hash)).to.be.true;
    });

    it("should reject verification from non-validator", async function () {
      const hash = sha256Bytes32("Arthashastra");
      const minStake = await vedaKnowledge.minStake();
      await vedaKnowledge.connect(contributor).registerSource(hash, "Arthashastra", "", { value: minStake });

      await expect(
        vedaKnowledge.connect(stranger).verifySource(hash)
      ).to.be.revertedWith("VedaKnowledge: not validator");
    });
  });

  // ─── ResponseLog Tests ──────────────────────────────────────────────────────

  describe("ResponseLog", function () {
    it("should log a response", async function () {
      const qHash = sha256Bytes32("What is dharma?");
      const aHash = sha256Bytes32("Dharma is the cosmic order...");

      await expect(
        responseLog.connect(owner).logResponse(qHash, aHash, [])
      ).to.emit(responseLog, "ResponseLogged").withArgs(0, qHash, aHash, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await responseLog.getTotalResponses()).to.equal(1);
    });

    it("should reject logging from unauthorized address", async function () {
      const qHash = sha256Bytes32("What is karma?");
      const aHash = sha256Bytes32("Karma is cause and effect...");

      await expect(
        responseLog.connect(stranger).logResponse(qHash, aHash, [])
      ).to.be.revertedWith("ResponseLog: not authorized logger");
    });

    it("should retrieve a logged response", async function () {
      const qHash = sha256Bytes32("What is Brahman?");
      const aHash = sha256Bytes32("Brahman is ultimate reality...");
      await responseLog.connect(owner).logResponse(qHash, aHash, []);

      const [rQ, rA] = await responseLog.getResponse(0);
      expect(rQ).to.equal(qHash);
      expect(rA).to.equal(aHash);
    });
  });

  // ─── VedaToken Tests ────────────────────────────────────────────────────────

  describe("VedaToken", function () {
    it("should have correct initial supply", async function () {
      const supply = await vedaToken.totalSupply();
      expect(supply).to.equal(ethers.parseEther("10000000")); // 10M VDT
    });

    it("should allow ERC-20 transfer", async function () {
      await vedaToken.connect(owner).transfer(contributor.address, ethers.parseEther("1000"));
      expect(await vedaToken.balanceOf(contributor.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should allow token burning", async function () {
      await vedaToken.connect(owner).transfer(contributor.address, ethers.parseEther("500"));
      await vedaToken.connect(contributor).burn(ethers.parseEther("200"));
      expect(await vedaToken.balanceOf(contributor.address)).to.equal(ethers.parseEther("300"));
    });
  });
});

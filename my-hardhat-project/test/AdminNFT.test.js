const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AdminNFT", function () {
  let adminNFT;
  let owner;
  let recipient;
  let otherAccount;

  const TEST_URI = "ipfs://QmTestHash123456789";

  beforeEach(async function () {
    // Get signers
    [owner, recipient, otherAccount] = await ethers.getSigners();

    // Deploy contract
    const AdminNFT = await ethers.getContractFactory("AdminNFT");
    adminNFT = await AdminNFT.deploy();
    await adminNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await adminNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await adminNFT.name()).to.equal("AdminNFT");
      expect(await adminNFT.symbol()).to.equal("ADMNFT");
    });

    it("Should start with token counter at 0", async function () {
      expect(await adminNFT.getCurrentTokenId()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT to recipient", async function () {
      await adminNFT.safeMint(recipient.address, TEST_URI);
      
      expect(await adminNFT.ownerOf(1)).to.equal(recipient.address);
      expect(await adminNFT.getCurrentTokenId()).to.equal(1);
    });

    it("Should set correct token URI", async function () {
      await adminNFT.safeMint(recipient.address, TEST_URI);
      
      expect(await adminNFT.tokenURI(1)).to.equal(TEST_URI);
    });

    it("Should only allow owner to mint", async function () {
      await expect(
        adminNFT.connect(otherAccount).safeMint(recipient.address, TEST_URI)
      ).to.be.revertedWithCustomError(adminNFT, "OwnableUnauthorizedAccount");
    });

    it("Should increment token ID for each mint", async function () {
      await adminNFT.safeMint(recipient.address, TEST_URI);
      await adminNFT.safeMint(otherAccount.address, TEST_URI);
      
      expect(await adminNFT.getCurrentTokenId()).to.equal(2);
      expect(await adminNFT.ownerOf(1)).to.equal(recipient.address);
      expect(await adminNFT.ownerOf(2)).to.equal(otherAccount.address);
    });
  });

  describe("Revocation", function () {
    beforeEach(async function () {
      // Mint a token first
      await adminNFT.safeMint(recipient.address, TEST_URI);
    });

    it("Should revoke a certificate", async function () {
      await adminNFT.revoke(1);
      
      expect(await adminNFT.isRevoked(1)).to.equal(true);
    });

    it("Should emit CertificateRevoked event", async function () {
      await expect(adminNFT.revoke(1))
        .to.emit(adminNFT, "CertificateRevoked")
        .withArgs(1, owner.address);
    });

    it("Should not allow non-owner to revoke", async function () {
      await expect(
        adminNFT.connect(otherAccount).revoke(1)
      ).to.be.revertedWithCustomError(adminNFT, "OwnableUnauthorizedAccount");
    });

    it("Should not revoke non-existent token", async function () {
      await expect(adminNFT.revoke(999)).to.be.revertedWith("Token does not exist");
    });

    it("Should not revoke already revoked token", async function () {
      await adminNFT.revoke(1);
      
      await expect(adminNFT.revoke(1)).to.be.revertedWith("Token already revoked");
    });

    it("Should return false for non-revoked token", async function () {
      expect(await adminNFT.isRevoked(1)).to.equal(false);
    });
  });

  describe("Reinstatement", function () {
    beforeEach(async function () {
      // Mint and revoke a token
      await adminNFT.safeMint(recipient.address, TEST_URI);
      await adminNFT.revoke(1);
    });

    it("Should reinstate a revoked certificate", async function () {
      await adminNFT.reinstate(1);
      
      expect(await adminNFT.isRevoked(1)).to.equal(false);
    });

    it("Should emit CertificateReinstated event", async function () {
      await expect(adminNFT.reinstate(1))
        .to.emit(adminNFT, "CertificateReinstated")
        .withArgs(1, owner.address);
    });

    it("Should not allow non-owner to reinstate", async function () {
      await expect(
        adminNFT.connect(otherAccount).reinstate(1)
      ).to.be.revertedWithCustomError(adminNFT, "OwnableUnauthorizedAccount");
    });

    it("Should not reinstate non-existent token", async function () {
      await expect(adminNFT.reinstate(999)).to.be.revertedWith("Token does not exist");
    });

    it("Should not reinstate non-revoked token", async function () {
      await adminNFT.reinstate(1); // First reinstate
      
      await expect(adminNFT.reinstate(1)).to.be.revertedWith("Token not revoked");
    });
  });

  describe("Full Lifecycle", function () {
    it("Should handle mint -> revoke -> reinstate -> revoke cycle", async function () {
      // Mint
      await adminNFT.safeMint(recipient.address, TEST_URI);
      expect(await adminNFT.isRevoked(1)).to.equal(false);
      
      // Revoke
      await adminNFT.revoke(1);
      expect(await adminNFT.isRevoked(1)).to.equal(true);
      
      // Reinstate
      await adminNFT.reinstate(1);
      expect(await adminNFT.isRevoked(1)).to.equal(false);
      
      // Revoke again
      await adminNFT.revoke(1);
      expect(await adminNFT.isRevoked(1)).to.equal(true);
    });
  });

  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await adminNFT.supportsInterface(ERC721_INTERFACE_ID)).to.equal(true);
    });

    it("Should support ERC721Metadata interface", async function () {
      // ERC721Metadata interface ID
      const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
      expect(await adminNFT.supportsInterface(ERC721_METADATA_INTERFACE_ID)).to.equal(true);
    });
  });
});

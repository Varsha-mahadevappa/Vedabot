/**
 * Seed script: register initial Vedic knowledge source hashes on-chain.
 * Run after deploy: npm run seed
 */
const hre = require("hardhat");
const crypto = require("crypto");
const deployments = require("../deployments.json");

const INITIAL_SOURCES = [
  { title: "Bhagavad Gita", description: "The Song of God — 18 chapters of dialogue between Krishna and Arjuna" },
  { title: "Rigveda", description: "The oldest of the four Vedas — 1028 hymns" },
  { title: "Principal Upanishads", description: "12 principal Upanishads forming the basis of Vedanta" },
  { title: "Yoga Sutras of Patanjali", description: "196 sutras on yoga philosophy and practice" },
  { title: "Sanskrit Vedic Concepts Glossary", description: "Key Sanskrit philosophical terms and etymology" },
];

function computeHash(text) {
  return "0x" + crypto.createHash("sha256").update(text).digest("hex");
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const { VedaKnowledge: address } = deployments.contracts;

  console.log("Seeding VedaKnowledge at:", address);
  console.log("Network:", hre.network.name);

  const VedaKnowledge = await hre.ethers.getContractFactory("VedaKnowledge");
  const contract = VedaKnowledge.attach(address);

  const minStake = await contract.minStake();
  console.log("Min stake:", hre.ethers.formatEther(minStake), "SHM\n");

  for (const source of INITIAL_SOURCES) {
    const hash = computeHash(source.title);
    console.log(`Registering: "${source.title}"`);
    console.log(`  Hash: ${hash}`);

    try {
      const tx = await contract.registerSource(hash, source.title, "", { value: minStake });
      await tx.wait();
      console.log("  Registered ✓");

      // Auto-verify (deployer is owner/validator)
      const verifyTx = await contract.verifySource(hash);
      await verifyTx.wait();
      console.log("  Verified on-chain ✓\n");
    } catch (err) {
      console.log(`  Skipped (${err.message.split("\n")[0]})\n`);
    }
  }

  console.log("Seeding complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

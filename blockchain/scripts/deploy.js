const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Network:", hre.network.name);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "SHM\n");

  // 1. Deploy VedaToken
  console.log("Deploying VedaToken...");
  const VedaToken = await hre.ethers.getContractFactory("VedaToken");
  const vedaToken = await VedaToken.deploy();
  await vedaToken.waitForDeployment();
  const vedaTokenAddress = await vedaToken.getAddress();
  console.log("VedaToken deployed to:", vedaTokenAddress);

  // 2. Deploy VedaKnowledge
  console.log("\nDeploying VedaKnowledge...");
  const VedaKnowledge = await hre.ethers.getContractFactory("VedaKnowledge");
  const vedaKnowledge = await VedaKnowledge.deploy();
  await vedaKnowledge.waitForDeployment();
  const vedaKnowledgeAddress = await vedaKnowledge.getAddress();
  console.log("VedaKnowledge deployed to:", vedaKnowledgeAddress);

  // 3. Deploy ResponseLog
  console.log("\nDeploying ResponseLog...");
  const ResponseLog = await hre.ethers.getContractFactory("ResponseLog");
  const responseLog = await ResponseLog.deploy();
  await responseLog.waitForDeployment();
  const responseLogAddress = await responseLog.getAddress();
  console.log("ResponseLog deployed to:", responseLogAddress);

  // 4. Link VedaToken minter to VedaKnowledge
  console.log("\nLinking VedaToken minter to VedaKnowledge...");
  const tx = await vedaToken.setMinter(vedaKnowledgeAddress);
  await tx.wait();
  console.log("Minter set successfully.");

  // 5. Save deployment addresses
  const deployments = {
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      VedaToken: vedaTokenAddress,
      VedaKnowledge: vedaKnowledgeAddress,
      ResponseLog: responseLogAddress,
    },
  };

  const outputPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployments, null, 2));
  console.log("\nDeployment addresses saved to:", outputPath);

  // 6. Print .env values
  console.log("\n─── Add these to your backend/.env ───");
  console.log(`VEDA_KNOWLEDGE_CONTRACT=${vedaKnowledgeAddress}`);
  console.log(`RESPONSE_LOG_CONTRACT=${responseLogAddress}`);
  console.log(`VEDA_TOKEN_CONTRACT=${vedaTokenAddress}`);
  console.log("──────────────────────────────────────");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

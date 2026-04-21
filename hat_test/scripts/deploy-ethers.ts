import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const artifact = JSON.parse(
    readFileSync(resolve("artifacts/contracts/ContentRegistry.sol/ContentRegistry.json"), "utf8")
  );

  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const wallet = new ethers.Wallet(
    "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
    provider
  );

  const network = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);
  console.log("ChainId :", network.chainId.toString());
  console.log("Deployer:", wallet.address);
  console.log("Balance :", ethers.formatEther(balance), "ETH");

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("Bytecode length:", artifact.bytecode.length);
  console.log("Deploying ContentRegistry...");
  const contract = await factory.deploy({ gasPrice: 0, gasLimit: 8_000_000 });
  console.log("TX Hash :", contract.deploymentTransaction()?.hash);

  await contract.waitForDeployment();
  console.log("Deployed:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });

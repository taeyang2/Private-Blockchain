import hre from "hardhat";

export const BESU_LEGACY_DEPLOYMENT = {
  gas: 6_000_000n,
  gasPrice: 0n,
  type: "legacy" as const,
};

export async function deployContentRegistry() {
  const connection = await hre.network.connect();
  const publicClient = await connection.viem.getPublicClient();
  const [walletClient] = await connection.viem.getWalletClients();
  const artifact = await hre.artifacts.readArtifact("ContentRegistry");

  if (walletClient === undefined) {
    throw new Error("No wallet client configured for the selected network");
  }

  const chainId = await publicClient.getChainId();
  const nonce = await publicClient.getTransactionCount({
    address: walletClient.account.address,
    blockTag: "pending",
  });
  const balance = await publicClient.getBalance({
    address: walletClient.account.address,
  });

  console.log("RPC chainId:", chainId);
  console.log("Deployer:", walletClient.account.address);
  console.log("Pending nonce:", nonce);
  console.log("Balance:", balance.toString());

  // Besu zero-base-fee QBFT networks can reject Ignition's type-2 deployment txs.
  const deploymentHash = await walletClient.deployContract({
    account: walletClient.account,
    abi: artifact.abi,
    bytecode: artifact.bytecode as `0x${string}`,
    nonce,
    ...BESU_LEGACY_DEPLOYMENT,
  });

  console.log("Deployment tx:", deploymentHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deploymentHash,
  });

  if (receipt.contractAddress === null || receipt.contractAddress === undefined) {
    throw new Error(
      `Deployment transaction ${deploymentHash} mined without a contract address`,
    );
  }

  console.log("ContentRegistry deployed at:", receipt.contractAddress);
}

deployContentRegistry().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

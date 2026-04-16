import hre from "hardhat";

const CONTRACT_ADDRESS =
  "0x42699A7612A82f1d9C36148af9C77354759b210b" as `0x${string}`;

const testHash =
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`;

async function main() {
  const connection = await hre.network.connect();
  const contract = await connection.viem.getContractAt(
    "ContentRegistry",
    CONTRACT_ADDRESS
  );

  // 1. registerContent 호출
  console.log("=== 1. registerContent 호출 ===");
  const txHash = await contract.write.registerContent([testHash]);
  console.log("TX Hash:", txHash);

  // 2. getContent 조회
  console.log("\n=== 2. getContent 조회 ===");
  const record = await contract.read.getContent([testHash]);
  console.log("Creator  :", record.creator);
  console.log("Timestamp:", record.timestamp.toString());

  // 3. isRegistered 조회
  console.log("\n=== 3. isRegistered 조회 ===");
  const registered = await contract.read.isRegistered([testHash]);
  console.log("isRegistered:", registered);
}

main().catch(console.error);

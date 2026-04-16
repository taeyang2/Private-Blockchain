import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ContentRegistryModule = buildModule("ContentRegistryModule", (m) => {
  const contentRegistry = m.contract("ContentRegistry");
  return { contentRegistry };
});

export default ContentRegistryModule;
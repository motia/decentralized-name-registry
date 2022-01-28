const NameRegistry = artifacts.require("NameRegistry");

module.exports = async function(deployer) {
  await deployer.deploy(NameRegistry);
};

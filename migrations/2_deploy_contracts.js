const Migrations = artifacts.require('Migrations');
const NameToken = artifacts.require('NameToken');
const NameRegistry = artifacts.require("NameRegistry");

module.exports = async function(deployer) {
  await deployer.deploy(NameToken);
  const token = await NameToken.deployed();

  await deployer.deploy(NameRegistry, token.address);

  const nameRegistry = await NameRegistry.deployed();

  await token.transfer(
      nameRegistry.address,
      "1800000000"
  );
};

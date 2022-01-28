const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const secrets = require('./secrets.json');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    develop: { // default with truffle unbox is 7545, but we can use develop to test changes, ex. truffle migrate --network develop
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(secrets.infura.memonic, `https://ropsten.infura.io/v3/${secrets.infura.projectId}`)
      },
      network_id: 3
    },
  },
  compilers: {
    solc: {
      version: "0.5.17",
    }
  }
};

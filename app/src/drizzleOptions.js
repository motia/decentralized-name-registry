import Web3 from "web3";
import NameRegistry from "./contracts/NameRegistry.json";

const options = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [NameRegistry],
  events: {
    NameRegistry: ['Registered', 'Renewed', 'Canceled'],
  },
};

export default options;

import Web3 from "web3";
import NameRegistry from "./contracts/NameRegistry.json";
import NameToken from "./contracts/NameToken.json";

const options = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [NameRegistry, NameToken],
  events: {
    NameRegistry: ['Registered', 'Renewed', 'Canceled'],
    NameToken: ['Transfer', 'Approval'],
  },
};

export default options;

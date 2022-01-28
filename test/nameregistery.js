const NameRegistry = artifacts.require("NameRegistry");
const {soliditySha3, asciiToHex, hexToAscii} = require("web3-utils");

contract("NameRegistry", accounts => {
    it("...should not register with 0 blocks.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        await nameRegistryInstance.register(asciiToHex("hello"), 0, {from: accounts[0]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not register with 0"))
    })

    it("...should register the name hello.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();

        // register name "hello"
        await nameRegistryInstance.register(asciiToHex("hello"), 10, {from: accounts[0]});

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.equal(result[0], accounts[0], "Expected accounts[0] wrong owner ");
        assert.equal(result[1], asciiToHex('hello').padEnd(result[1].length, '0'), "Wrong name");
        assert.ok(result[2].gt(10), "Expected expires after 10 blocks but got " + JSON.stringify(result[2]));
    });


    it("...should not register when already registered.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();

        await nameRegistryInstance.register(asciiToHex("hello"), 10, {from: accounts[0]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not register using the same account"))

        await nameRegistryInstance.register(asciiToHex("hello"), 10, {from: accounts[1]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not register using the other account"))
    });

    it("...should renew the name hello.", async () => {
      const nameRegistryInstance = await NameRegistry.deployed();

      // register name "hello"
      await nameRegistryInstance.renew(asciiToHex("hello"), 5, { from: accounts[0] });

      // get the name owner
      const result = await nameRegistryInstance.getNameInfo.call(
          asciiToHex("hello")
      );

      assert.equal(result[0], accounts[0], "Expected accounts[0] wrong owner ");
      assert.equal(result[1], asciiToHex('hello').padEnd(result[1].length, '0'), "Wrong name");
      assert.ok(result[2].gt(15), "Expected expires after 15 blocks but got "+JSON.stringify(result[2]));
    });

});

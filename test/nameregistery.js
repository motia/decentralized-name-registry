const NameRegistry = artifacts.require("NameRegistry");
const NameToken = artifacts.require("NameToken");
const {asciiToHex, BN} = require("web3-utils");

contract("NameRegistry", accounts => {
    let expiry_after_registration = null;
    let expiry_after_renewal = null;
    let expiry_after_cancel = null;

    const blockReservationPrice = 1000;

    it("...should not register with 0 blocks.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        await token.transfer(accounts[1], "1000");
        await token.transfer(accounts[2], "1000");

        await token.approve(nameRegistryInstance.address, '1000',{ from: accounts[1] });
        await token.approve(nameRegistryInstance.address, '1000',{ from: accounts[2] });

        await nameRegistryInstance.register(asciiToHex("hello"), 0, {from: accounts[1]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not register with 0"))

        assert.equal((await token.balanceOf(accounts[1])).toString(), '1000', 'account[1] balance did not change');
    })

    it("...should register the name hello.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        // register name "hello"
        await nameRegistryInstance.register(asciiToHex("hello"), 10, {from: accounts[1]});

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.equal(result[0], accounts[1], "Expected accounts[1] wrong owner ");
        assert.equal(result[1], asciiToHex('hello').padEnd(result[1].length, '0'), "Wrong name");
        assert.ok(result[2].gt(10), "Expected expires after 10 blocks but got " + JSON.stringify(result[2]));

        expiry_after_registration = result[2];
        assert.equal((await token.balanceOf(accounts[1])).toString(), '900', 'account[1] balance was spent');
    });


    it("...should not register when already registered.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        await nameRegistryInstance.register(asciiToHex("hello"), 10, {from: accounts[1]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not register using the same account"))

        await nameRegistryInstance.register(asciiToHex("hello"), 10, {from: accounts[2]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not register using the other account"));

        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.ok(expiry_after_registration.eq(result[2]), "Name entry expires_at should not change");
        assert.equal((await token.balanceOf(accounts[2])).toString(), '1000', 'account[2] balance did not change');
    });

    it("...should renew the name hello.", async () => {
        expiry_after_renewal = expiry_after_registration.add(new BN(5));
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        // register name "hello"
        await nameRegistryInstance.renew(asciiToHex("hello"), 5, {from: accounts[1]});

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.equal(result[0], accounts[1], "Expected accounts[1] wrong owner ");
        assert.equal(result[1], asciiToHex('hello').padEnd(result[1].length, '0'), "Wrong name");
        assert.ok(result[2].eq(expiry_after_renewal), "Expected expires at should increase by 5" + JSON.stringify({
            received: result[2],
            expiry_after_renewal,
        }));

        assert.equal((await token.balanceOf(accounts[1])).toString(), '850', 'account[1] balance was spent');
    });

    it("...should fail at renewing with wrong account.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        // register name "hello"
        await nameRegistryInstance.renew(asciiToHex("hello"), 3, {from: accounts[2]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not cancel using the same account"))

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.ok(result[2].eq(expiry_after_renewal), "Expected expiry date did not change");
        assert.equal((await token.balanceOf(accounts[2])).toString(), '1000', 'account[2] balance was not spent');
    });


    it("...should fail at canceling with wrong account.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        // register name "hello"
        await nameRegistryInstance.cancel(asciiToHex("hello"), {from: accounts[2]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not cancel using the same account"))

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.ok(result[2].eq(expiry_after_renewal), "Expected expiry date did not change");
        assert.equal((await token.balanceOf(accounts[1])).toString(), '850', 'account[1] was not refunded');
        assert.equal((await token.balanceOf(accounts[2])).toString(), '1000', 'account[2] balance was not spent');
    });


    it("...should cancel the name hello.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        // register name "hello"
        await nameRegistryInstance.cancel(asciiToHex("hello"), {from: accounts[1]});

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        expiry_after_cancel = result[2];

        assert.equal(result[0], accounts[1], "Expected accounts[1] wrong owner ");
        assert.equal(result[1], asciiToHex('hello').padEnd(result[1].length, '0'), "Wrong name");
        assert.ok(result[2].lt(expiry_after_renewal), "Expected expiry block to change");

        assert.ok((await token.balanceOf(accounts[1])).gt(new BN('850')), 'account[1] balance got refund');
     });

    it("...should fail at canceling already canceled.", async () => {
        const nameRegistryInstance = await NameRegistry.deployed();
        const token = await NameToken.deployed();

        // register name "hello"
        await nameRegistryInstance.cancel(asciiToHex("hello"), {from: accounts[2]})
            .catch(() => "failed")
            .then((x) => assert.ok(x === 'failed', "Should not cancel using the same account"))

        // get the name owner
        const result = await nameRegistryInstance.getNameInfo.call(
            asciiToHex("hello")
        );

        assert.ok(result[2].eq(expiry_after_cancel), "Expected expiry block did not change");
    });
});

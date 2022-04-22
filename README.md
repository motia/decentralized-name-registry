## Description

The name registration system is permissionless, allowing any user to reserve an unregistered name by locking some deposit called "name-fee" proportional to the time he registers the name.


## Development
### Start blockchain
```bash
// run truffle daemon
npx truffle develop --log

// migrate
npx truffle migrate --reset --network=develop

// test
npx truffle test
```

### Start frontend app
```bash
cd app && yarn start
```


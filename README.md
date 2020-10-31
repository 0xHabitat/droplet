# About

Dispenser is a modern escrow, smart contract on Ethereum.

A dispenser has a payer, a ERC-20 token that gets dispensed and one or more payees with specific rates per drip of that ERC-20 token.

Additionaly a contract start time must be defined, this defines the date the dispenser starts to drip. The start time can be in the future or past.

Anyone can transfer funds to the dispenser at any time and accumulated drip rates goes to the payees.

The dispensing contract can be drained if the payer wants to abort the contract. A drain pays all remaining funds back to the payer minus the accumulated drip rates for the payees.

Any remaining dust also gets transferred to the payer.

## Token recovery

If a wrong ERC-20 token gets transferred to the dispenser, then this token can be recovered by an additional function (`recoverLostTokens`) that sends the funds to the first payee of the dispensing contract. After that, additional social recovery can/must be performed.

# Development

Run the tests with `yarn test`.
You can run single/multiple tests only with `yarn _test path/to/file(s)`.
The tests require `geth`, version `1.9.9` is recommended and you can grab it here: `https://geth.ethereum.org/downloads/`.


# Deploy

```
GAS_GWEI=3 ROOT_RPC_URL=http://localhost:8222 PRIV_KEY=0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200 ./scripts/deploy.js build/contracts/Dispenser.json
```

# Deployments

## mainnet

### Contract

https://etherscan.io/address/0xeC41c0F035Ce9127c506fD726fC22F393b350fE4

### UI

https://bafybeibk55sce6thtb222o7dqemsqrdoyaelndx5xawg7aojcoyvutkwkm.ipfs.infura-ipfs.io/
https://bafybeibk55sce6thtb222o7dqemsqrdoyaelndx5xawg7aojcoyvutkwkm.ipfs.cf-ipfs.com/

## ropsten

### Contract

https://ropsten.etherscan.io/address/0x55973C53DdE65A050BFBb15ADc6a9F19B7A888A6

### UI

https://bafybeiatkzhpyx24b3mdgpgqrypx2wqxgyiac5ikxtg67qsyx5iyhemcei.ipfs.infura-ipfs.io/
https://bafybeiatkzhpyx24b3mdgpgqrypx2wqxgyiac5ikxtg67qsyx5iyhemcei.ipfs.cf-ipfs.com/

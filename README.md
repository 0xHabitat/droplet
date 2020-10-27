# About

Dispenser is a modern escrow, smart contract on Ethereum.
A dispenser has a payer, a ERC-20 token that gets dispensed and one or more payees with specific rates per hour of that ERC-20 token.
Additionaly a contract start time must be defined, this defines the date the dispenser starts to drip. The start time can be in the future or past.

Anyone can transfer funds to the dispenser at any time, Any accumulated hourly rates goes to the payees.
The dispensing contract can be drained if the payer wants to abort the contract. A drain pays all remaining funds back to the payer minus the accumulated hourly rates for the payees.

Any remaining dust also gets transfered to the payer.

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
https://etherscan.io/address/0xEc2CEaF2b34D12f321aB5718B0714a12710D8bFa
### UI
https://bafybeiaqt2bh4ln2y4ls2n7g43epppqcdiwhonsc4pdgvv7yexguupns7q.ipfs.infura-ipfs.io/
https://bafybeiaqt2bh4ln2y4ls2n7g43epppqcdiwhonsc4pdgvv7yexguupns7q.cf-ipfs.com/


# Development

Run the tests with `yarn test`.
You can run single/multiple tests only with `yarn _test path/to/file(s)`.
The test require `geth` version `1.9.9` is recommended and you can grab it here: `https://geth.ethereum.org/downloads/`.


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

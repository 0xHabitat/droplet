import assert from 'assert';
import ethers from 'ethers';

export const PRIV_KEY_MAIN = '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200';
export const PRIV_KEY_ALICE = '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501203';
export const PRIV_KEY_BOB = '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204';
export const GAS_LIMIT = 6_000_000;

export async function waitForValueChange (oldValue, getNewValue) {
  while (true) {
    if (oldValue.toString() !== (await getNewValue()).toString()) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function assertRevert (tx) {
  let reverted = false;

  try {
    await (await tx).wait();
  } catch (e) {
    reverted = e.code === 'CALL_EXCEPTION';
  }

  assert.ok(reverted, 'Expected revert');
}

export async function produceBlocks (t, wallet) {
  for (let i = 0; i < t; i++) {
    const tx = await wallet.sendTransaction({ to: await wallet.getAddress() });
    await tx.wait();
  }
}

export function getDefaultWallets () {
  const rootRpcUrl = `http://localhost:${process.env.RPC_PORT}`;
  const rootProvider = new ethers.providers.JsonRpcProvider(rootRpcUrl);

  const baseKey = '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b750120';
  return {
    alice: new ethers.Wallet(baseKey + '0', rootProvider),
    bob: new ethers.Wallet(baseKey + '1', rootProvider),
    charlie: new ethers.Wallet(baseKey + '2', rootProvider),
    daniel: new ethers.Wallet(baseKey + '3', rootProvider),
    eva: new ethers.Wallet(baseKey + '4', rootProvider),
  };
}

export async function deploy (artifact, wallet, ...args) {
  const _factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  const contract = await _factory.deploy(...args);
  await contract.deployTransaction.wait();

  return contract;
}

export async function submitBlock (bridge, rootProvider, myNode) {
  const blockN = await myNode.getBlockNumber();
  await myNode.send('debug_submitBlock', []);
  await waitForValueChange(blockN, () => myNode.getBlockNumber());
}

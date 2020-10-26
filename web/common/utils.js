import { ROOT_CHAIN_ID, DISPENSER_ADDRESS } from '../config.js';
import { DISPENSER_ABI, ERC20_ABI } from './constants.js';

export function wrapListener (selector, func) {
  document.querySelector(selector).addEventListener(
    'click',
    async function (evt) {
      evt.preventDefault();
      evt.target.disabled = true;

      try {
        await func(evt);
      } catch (e) {
        alert(e.toString());
      }

      evt.target.disabled = false;
    },
    false
  );
}

export async function getErc20 (addr) {
  return new ethers.Contract(addr, ERC20_ABI, ethers.getDefaultProvider(ROOT_CHAIN_ID));
}

export async function getDispenser (addr) {
  return new ethers.Contract(addr || DISPENSER_ADDRESS, DISPENSER_ABI, ethers.getDefaultProvider(ROOT_CHAIN_ID));
}

export async function getSigner () {
  if (document._signer) {
    return document._signer;
  }

  if (!window.ethereum) {
    throw new Error('Please visit this page with a dApp compatible browser');
  }

  // TODO: check for errors
  await window.ethereum.enable();
  const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
  const network = await signer.provider.getNetwork();

  if (network.chainId !== ROOT_CHAIN_ID) {
    throw new Error(`Please switch your wallet network to ${ethers.utils.getNetwork(ROOT_CHAIN_ID).name}`);
  }

  document._signer = signer;

  return signer;
}

export async function displayFeedback (tag, target, tx) {
  function renderLink (str) {
    const isAddress = str.length == 42;
    const a = document.createElement('a');
    a.target = '_blank';

    if (ROOT_CHAIN_ID === 1) {
      a.href = `https://etherscan.io/`;
    } else {
      const network = ethers.utils.getNetwork(ROOT_CHAIN_ID);
      a.href = `https://${network.name}.etherscan.io/`;
    }

    if (isAddress) {
      a.textContent = `${tag}, Contract: ${str}`;
      a.href += `address/${str}`;
    } else {
      a.textContent = `${tag}, Transaction Hash: ${str}`;
      a.href += `tx/${str}`;
    }

    return a;
  }
  document.querySelector('#feedback').appendChild(renderLink(tx.hash));

  const tmp = target.textContent;
  target.textContent = 'Waiting...';
  const receipt = await tx.wait();
  target.textContent = tmp;
}

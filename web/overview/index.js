import { getSigner, getDispenser, getErc20, wrapListener, displayFeedback } from '../common/utils.js';

let metadata, erc20, dispenser;

function formatDripRate (bigNum) {
  const day = 24 * 3600;
  const hours = bigNum.mod(day);
  const days = bigNum.div(day);
  const d = days.gt(1) ? ' days' : ' day';
  const h = hours.gt(1) ? ' hours' : ' hour';

  return `${days.gt(0) ? days + d : ''} ${hours.gt(0) ? hours + h : ''}`;
}

async function drain (evt) {
  const signer = await getSigner();
  const tx = await dispenser.connect(signer).drain();

  await displayFeedback('Draining funds to Payer', evt.target, tx);
}

async function drip (evt) {
  const signer = await getSigner();
  const tx = await dispenser.connect(signer).drip();

  await displayFeedback('Dripping funds to Payees', evt.target, tx);
}

async function render () {
  wrapListener('button#drip', drip);
  wrapListener('button#drain', drain);

  const contractAddress = window.location.href.split('#').pop();

  dispenser = await getDispenser(contractAddress);
  metadata = await dispenser.getMetadata();
  erc20 = await getErc20(metadata.token);

  const balance = await erc20.balanceOf(dispenser.address);
  const symbol = await erc20.symbol();
  const decimals = await erc20.decimals();

  document.querySelector('#contract').textContent = dispenser.address;
  document.querySelector('#payer').textContent = metadata.payer;
  document.querySelector('#startTime').textContent =
    (new Date(metadata.startTime.mul(1000).toNumber())).toLocaleString();
  document.querySelector('#token').textContent = symbol;
  document.querySelector('#dripRate').textContent = formatDripRate(metadata.dripRateSeconds);

  document.querySelector('#balance').textContent =
    `${ethers.utils.formatUnits(balance, decimals)} ${symbol}`;

  const grid = document.querySelector('.grid');
  const len = metadata.payees.length;
  for (let i = 0; i < len; i++) {
    const payee = metadata.payees[i];
    const ratePerDrip = ethers.utils.formatUnits(metadata.ratesPerDrip[i], decimals);

    const a = document.createElement('p');
    const b = document.createElement('p');

    a.textContent = payee;
    b.textContent = ratePerDrip;
    grid.appendChild(a);
    grid.appendChild(b);
  }
}

window.addEventListener('DOMContentLoaded', render, false);

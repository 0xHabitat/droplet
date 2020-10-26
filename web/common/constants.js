
export const ERC20_ABI = [
  'symbol() view returns (string)',
  'decimals() view returns (uint8)',
  'allowance(address,address) view returns (uint256)',
  'balanceOf(address) view returns (uint256)',
  'approve(address spender,uint256 value) returns (bool)',
  'transfer(address,uint256) returns (bool)',
];

export const DISPENSER_ABI = [
  'event NewDispenser(address contractAddress)',
  'function create(address token, address payer, uint256 startTime, address[] payees, uint256[] ratesPerHour) returns (address addr)',
  'function drain()',
  'function drip()',
  'function getMetadata() view returns (address token, address payer, uint256 startTime, address[] payees, uint256[] ratesPerHour)',
  'function lastUpdate() view returns (uint256)',
  'function recoverLostTokens(address lostToken)',
  'function setup()'
];

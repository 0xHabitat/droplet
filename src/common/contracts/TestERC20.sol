// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.6.2;

import './ERC20.sol';

contract TestERC20 is ERC20 {
  event Deposit(address indexed from, uint256 value);
  event Withdrawal(address indexed from, uint256 value);

  bool _ret;
  bool _lock;
  address _owner;

  constructor () public {
    _owner = msg.sender;
    _ret = true;
    _balances[msg.sender] = uint256(-1);
  }

  function deposit () public payable {
    _balances[msg.sender] += msg.value;
    emit Deposit(msg.sender, msg.value);
  }

  function withdraw (uint256 value) public {
    require(_balances[msg.sender] >= value);
    _balances[msg.sender] -= value;
    msg.sender.transfer(value);
    emit Withdrawal(msg.sender, value);
  }

  function _transferFrom (address from, address to, uint256 value) internal override returns (bool) {
    if (_lock) {
      revert();
    }

    ERC20._transferFrom(from, to, value);

    return _ret;
  }

  function ret (bool v) public {
    require(msg.sender == _owner);
    _ret = v;
  }

  function lock (bool v) public {
    require(msg.sender == _owner);
    _lock = v;
  }
}

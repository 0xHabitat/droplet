const { Dispenser, TestERC20 } = Artifacts;

describe('Dispenser', () => {
  const { alice, bob, charlie, eva } = getDefaultWallets();
  const payer = eva;
  const startTime = ~~(Date.now() / 1000) - 3597;
  const endTime = startTime + 3602;
  const durationSeconds = BigInt(endTime - startTime);
  const dripRateSeconds = 3600;
  const ratesPerHour = [BigInt(2 * 10**18), BigInt(4) , BigInt(3)];
  const minAmount = ratesPerHour.reduce((a, b) => b + a);
  const fullAmount = minAmount * (durationSeconds / BigInt(3600));
  const leftoverBalance = 1n;
  const payees = [alice.address, bob.address, charlie.address];
  let factory;
  let dispenser;
  let erc20;
  let wrongErc20;
  let args;
  let received = [0n, 0n, 0n];

  before('Prepare contracts', async () => {
    erc20 = await deploy(TestERC20, eva);
    wrongErc20 = await deploy(TestERC20, eva);
    factory = await deploy(Dispenser, eva);

    args = [
      erc20.address,
      payer.address,
      startTime,
      dripRateSeconds,
      payees,
      ratesPerHour,
    ];
  });

  it('create dispenser with zero rates - should fail', async () => {
    await assertRevert(factory.create(erc20.address, payer.address, startTime, dripRateSeconds, [alice.address], [0], { gasLimit: 9_000_000 }));
  });

  it('create dispenser with zero drip rate - should fail', async () => {
    await assertRevert(factory.create(erc20.address, payer.address, startTime, 0, [alice.address], [222], { gasLimit: 9_000_000 }));
  });

  it('create dispenser with wrong arguments - should fail', async () => {
    await assertRevert(factory.create(erc20.address, payer.address, startTime, dripRateSeconds, [alice.address], [], { gasLimit: 9_000_000 }));
  });

  it('create dispenser with wrong arguments - should fail', async () => {
    await assertRevert(factory.create(erc20.address, payer.address, startTime, dripRateSeconds, [], [1], { gasLimit: 9_000_000 }));
  });

  it('create dispenser', async () => {
    const tx = await factory.create(...args);
    const receipt = await tx.wait();

    console.log(receipt.gasUsed.toString());
    const addr = receipt.events[0].args[0];

    dispenser = factory.attach(addr);

    const meta = await dispenser.getMetadata();
    assert.deepEqual(
      meta.map((e) => e.toString()),
      args.map((e) => e.toString()),
      'metadata should equal `create` arguments'
    );
  });

  it('setup second time - should fail', async () => {
    await assertRevert(dispenser.setup({ gasLimit: 9_000_000 }));
  });

  it('transfer tokens to dispenser', async () => {
    // anyone can pay
    const tx = await erc20.transfer(dispenser.address, fullAmount + leftoverBalance);
    const receipt = await tx.wait();

    assert.equal(receipt.status, '0x1', 'should succeed');
  });

  it('drip', async () => {
    let updatedOnce = false;
    let time = 0;
    while (time <= endTime) {
      time = (await dispenser.provider.getBlock()).timestamp;
      const lastUpdate = Number(await dispenser.lastUpdate());
      const hours = ~~((time - lastUpdate) / 3600);
      const balance = await erc20.balanceOf(dispenser.address);

      const tx = await dispenser.drip({ gasLimit: 9_000_000 });
      const receipt = await tx.wait();
      assert.equal(receipt.status, '0x1');

      const didUpdate = (Number(await dispenser.lastUpdate()) - lastUpdate) !== 0;
      if (didUpdate) {
        updatedOnce = true;

        assert.ok(receipt.logs.length >= payees.length, 'min. amount of log events');
        const hours = (await dispenser.lastUpdate()).sub(lastUpdate).div(3600);

        for (let i = 0; i < ratesPerHour.length; i++) {
          const amount = BigInt(receipt.logs[i].data);

          assert.equal(amount.toString(), (ratesPerHour[i] * BigInt(hours)).toString(), 'drip amount should match ratePerHour * hours');
          received[i] += BigInt(amount);
        }

        if (receipt.logs.length === ratesPerHour.length + 1) {
          // dust?, contract should be empty now
          assert.equal((await erc20.balanceOf(dispenser.address)).toString(), '0');
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      await produceBlocks(1, eva);
    }

    assert.ok(updatedOnce, 'contract should update');

    for (let i = 0; i < payees.length; i++) {
      const payee = payees[i];
      const balance = await erc20.balanceOf(payee);

      assert.equal(balance.toString(), received[i].toString(), 'ratesPerHour should match');
    }
  });

  it('check dispenser balance', async () => {
    const balance = await erc20.balanceOf(dispenser.address);

    assert.equal(balance.toString(), '0', 'dust should be sweeped');
  });

  it('transfer tokens to dispenser', async () => {
    // anyone can pay
    const tx = await erc20.transfer(dispenser.address, (minAmount * 30n));
    const receipt = await tx.wait();

    assert.equal(receipt.status, '0x1', 'should succeed');
  });

  it('drain should fail - msg.sender != payer', async () => {
    await assertRevert(dispenser.connect(bob).drain({ gasLimit: 9_000_000 }));
  });

  it('drain leftover dispenser balance', async () => {
    const _lastUpdate = Number(await dispenser.lastUpdate());
    const payerBalanceBefore = await erc20.balanceOf(payer.address);
    const balanceBefore = await erc20.balanceOf(dispenser.address);
    const tx = await dispenser.drain();
    const receipt = await tx.wait();
    const balanceAfter = await erc20.balanceOf(dispenser.address);
    const payerBalance = await erc20.balanceOf(payer.address);
    const lastUpdate = Number(await dispenser.lastUpdate());
    const hours = BigInt(lastUpdate - _lastUpdate) / BigInt(3600);

    assert.equal(receipt.status, '0x1');
    assert.equal(receipt.logs.length, 1, 'dust');
    assert.equal(balanceAfter.toString(), '0');
    assert.equal(payerBalance.toString(), balanceBefore.sub(minAmount * hours).add(payerBalanceBefore).toString());
  });

  it('transfer wrong tokens to dispenser', async () => {
    // anyone can pay
    const tx = await wrongErc20.transfer(dispenser.address, fullAmount);
    const receipt = await tx.wait();

    assert.equal(receipt.status, '0x1', 'should succeed');
  });

  it('recover wrong tokens to first payee', async () => {
    const balance = await wrongErc20.balanceOf(dispenser.address);
    const tx = await dispenser.recoverLostTokens(wrongErc20.address);
    const receipt = await tx.wait();

    assert.equal(receipt.status, '0x1', 'should succeed');
    assert.equal((await wrongErc20.balanceOf(dispenser.address)).toString(), '0');
    assert.equal((await wrongErc20.balanceOf(payees[0])).toString(), balance.toString());
  });
});

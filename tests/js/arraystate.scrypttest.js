const { expect } = require('chai');
const { bsv, buildContractClass, getPreimage, toHex, num2bin, SigHashPreimage } = require('scryptlib');

const {
  inputIndex,
  inputSatoshis,
  newTx,
  DataLen,
  compileContract
} = require('../../helper');

const tx = newTx();
const outputAmount = 6000

describe('Test sCrypt contract Counter In Javascript', () => {
  let counter, preimage, result

  before(() => {
    const Counter = buildContractClass(compileContract('arraystate.scrypt'))
    counter = new Counter([0,1,2])


    const newLockingScript = counter.getNewStateScript({
      counters: [1,2,4]
    })

    tx.addOutput(new bsv.Transaction.Output({
      script: newLockingScript,
      satoshis: outputAmount
    }))

    preimage = getPreimage(tx, counter.lockingScript, inputSatoshis)

    // set txContext for verification
    counter.txContext = {
      tx,
      inputIndex,
      inputSatoshis
    }
  });

  it('should succeed when pushing right preimage & amount', () => {
    result = counter.increment(new SigHashPreimage(toHex(preimage)), outputAmount).verify()
    expect(result.success, result.error).to.be.true
  });

  
});
const { expect } = require('chai');
const { bsv, buildContractClass, getPreimage, toHex, Bytes,
  PrivKey, PubKey, Ripemd160, Sha256, OpCodeType, SigHashType, Sig, SigHashPreimage } = require('scryptlib');
const { SigHash } = require('scryptlib/dist/scryptTypes');
const {
  inputIndex,
  inputSatoshis,
  newTx,
  DataLen,
  compileContract
} = require('../../helper');


const outputAmount = 6000

describe('Test sCrypt contract Counter In Javascript', () => {
  let stateExample, preimage, result

  before(() => {
    const StateExample = buildContractClass(compileContract('state.scrypt'))


    stateExample = new StateExample(1000, new Bytes('0101'), true,
      new PrivKey("11"),
      new PubKey("03f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf"),
      new Ripemd160("40933785f6695815a7e1afb59aff20226bbb5bd4"),
      new Sha256("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
      new OpCodeType('76'),
      new SigHashType(SigHash.ALL | SigHash.FORKID),
      new Sig("304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541")
    );

    let newLockingScript = stateExample.getNewStateScript({
      counter: 1001,
      state_bytes: new Bytes('010101'),
      state_bool: false,
      privKey: new PrivKey("11"),
      pubkey: new PubKey("03f4a8ec3e44903ea28c00113b351af3baeec5662e5e2453c19188fbcad00fb1cf"),
      ripemd160: new Ripemd160("40933785f6695815a7e1afb59aff20226bbb5bd4"),
      sha256: new Sha256("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
      opCodeType: new OpCodeType('76'),
      sigHashType: new SigHashType(SigHash.ALL | SigHash.FORKID),
      sig: new Sig("304402207b6ce0aaae3a379721a364ab11414abd658a9940c10d48cd0bc6b273e81d058902206f6c0671066aef4c0de58ab8c349fde38ef3ea996b9f2e79241ebad96049299541")
    });

    const tx = newTx(inputSatoshis);
    tx.addOutput(new bsv.Transaction.Output({
      script: newLockingScript,
      satoshis: outputAmount
    }))

    preimage = getPreimage(tx, stateExample.lockingScript, inputSatoshis)

    stateExample.txContext = {
      tx,
      inputIndex,
      inputSatoshis
    }
  });

  it('should succeed when pushing right preimage & amount', () => {

    result = stateExample.unlock(new SigHashPreimage(toHex(preimage)), outputAmount).verify()

    const file = stateExample.unlock(new SigHashPreimage(toHex(preimage)), outputAmount).genLaunchConfig();
    console.log(file)
    expect(result.success, result.error).to.be.true
  });


});
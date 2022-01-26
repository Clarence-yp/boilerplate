const { expect } = require('chai');
const { buildContractClass, Sig, PubKey, toHex, bsv, signTx } = require('scryptlib');
const { inputIndex, inputSatoshis, newTx, compileContract } = require('../../helper');
const privateKey = new bsv.PrivateKey.fromWIF('cNkkpJJ5L3Ybs44MBPEbPVzxktDLpUKQkcs7mURDsYrrDwWEgiJF')
const publicKey = privateKey.publicKey

const tx = newTx();
describe('Test sCrypt contract Demo In Javascript', () => {
  let main, result

  before(() => {
    const Main = buildContractClass(compileContract('main.scrypt'));
    main = new Main(10);
  });

  it('should return true when call first', () => {
    sig = signTx(tx, privateKey, main.lockingScript, inputSatoshis)
    console.log(toHex(sig))
    console.log(toHex(publicKey))
    console.log(`${privateKey.toWIF()}`)
    
    result = main.first(10, new Sig(toHex(sig)), 
    new PubKey(toHex(publicKey))).verify({ tx, inputIndex, inputSatoshis })
    expect(result.success, result.error).to.be.true
  });

  it('should return true when call second', () => {

    result = main.second(3, 7).verify()
    expect(result.success, result.error).to.be.true

  });

  it('should return true when call three', () => {

    result = main.three(5).verify()
    expect(result.success, result.error).to.be.true
  });

});

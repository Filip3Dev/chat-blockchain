'use strict';

const axios = require('axios');
const Tx = require('ethereumjs-tx').Transaction;
const fs = require('fs');
const Web3 = require('web3');

const CONSTANTS = require('./constants');

class SmartContract {
  constructor() {
    const contractHash = CONSTANTS.SMART_CONTRACT.HASH;
    const contractPath = CONSTANTS.SMART_CONTRACT.PATH;
    const contractInterface = fs.readFileSync(contractPath, 'utf-8');

    const web3Provider = CONSTANTS.WEB3.PROVIDER;

    this._interface = JSON.parse(contractInterface).abi;

    this._web3 = new Web3();
    this._web3.setProvider(new this._web3.providers.HttpProvider(web3Provider));
    this._web3.eth.defaultAccount = CONSTANTS.SMART_CONTRACT.CALLER;
    // this._web3.setProvider(new this._web3.providers.WebsocketProvider(web3Provider));
    this._contract = new this._web3.eth.Contract(this._interface, contractHash);

    this._caller = CONSTANTS.SMART_CONTRACT.CALLER;

    this._gasLimit = CONSTANTS.SMART_CONTRACT.GAS_LIMIT;
  }

  async getCurrentGasPrices() {
    const response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    const prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    };

    return prices;
  }

  async sendSignedTransaction(transactionData) {
    const gasPrices = await this.getCurrentGasPrices();
    const gasPrice = gasPrices.medium.toString();
    const txCount = await this._web3.eth.getTransactionCount(this._web3.eth.defaultAccount);

    const txObject = {
      nonce: this._web3.utils.toHex(txCount),
      to: CONSTANTS.SMART_CONTRACT.HASH,
      value: this._web3.utils.toHex(this._web3.utils.toWei('0', 'ether')),
      gasLimit: this._web3.utils.toHex(2100000),
      gasPrice: this._web3.utils.toHex(this._web3.utils.toWei('6', 'gwei')),
      data: transactionData
    };

    const tx = new Tx(txObject, { chain: 'ropsten' });
    tx.sign(Buffer.from(CONSTANTS.WEB3.PRIVATE_KEY, 'hex'));

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    try {
      const transaction = await this._web3.eth.sendSignedTransaction(raw);
      return {
        error: false,
        message: 'Transação registrada',
        data: transaction.transactionHash,
      };
    } catch (error) {
      console.log('Deu erro: ', error);
      return {
        error: true,
        message: 'Falha ao registrar transação',
        data: error
      };
    }

  }

  get caller() {
    return this._caller;
  }

  get contract() {
    return this._contract;
  }

  get gasLimit() {
    return this._gasLimit;
  }

  get interface() {
    return this._interface;
  }
}

module.exports = new SmartContract();

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');
const messageText = 'Initial message';
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    inbox = await new web3.eth.Contract(JSON.parse(interface))
                    .deploy({ 
                        data: bytecode, 
                        arguments: [messageText] 
                    })
                    .send({ from: accounts[0], gas: '1000000' })
});

describe('Inbox testing', () => {
    it('Deploy the contract', () => {
        assert.ok(inbox.options.address);
    });

    it('Check default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, messageText);
    });

    it('Modify message', async () => {
        const newMessage = 'The new message';
        await inbox.methods.setMessage(newMessage).send({ from: accounts[0] });

        const message = await inbox.methods.message().call();
        assert.equal(message, newMessage);
    });
});
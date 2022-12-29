const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
                .deploy({ data: evm.bytecode.object })
                .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery contract', () => {
    it('Deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('Allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const participants = await lottery.methods.getEntries().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], participants[0]);
        assert.equal(1, participants.length);
    });

    it('Allows multiple accounts to enter', async () => {
        //account 1
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        //account 2
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        //account 3
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const participants = await lottery.methods.getEntries().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], participants[0]);
        assert.equal(accounts[1], participants[1]);
        assert.equal(accounts[2], participants[2]);

        assert.equal(3, participants.length);
    });

    it('Requires of minimum amount of ether to enter', async () => {
        try 
        {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            
            assert(false);
        } 
        catch (err) 
        {
            assert(err);
        }
    });

    it('Check if only the manager can call pickWinner function', async () => {
        try 
        {
            await lottery.methods.pickWinner().send({ 
                from: accounts[1]
            });

            assert(false);
        }
        catch (err)
        {
            assert(err);
        }
    });

    it('Send money to the winner and resets', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        
        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});
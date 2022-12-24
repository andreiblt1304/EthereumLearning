const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
//interface == ABI

const provider = new HDWalletProvider(
    'imitate cactus same army buyer sword match palace festival stem left crucial',
    'https://goerli.infura.io/v3/f39e0f16154449f9b36c4efada7a824c'
);
const web3 = new Web3(provider);
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from contract', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
                .deploy({ data: bytecode, arguments: ['Hi there!'] })
                .send({ gas: '1000000', from: accounts[0] });
    
    console.log('The address where the contract was deployed at ' + result.options.address);
    provider.engine.stop();
};

deploy();
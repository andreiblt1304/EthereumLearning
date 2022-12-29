// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lotery {
    address public manager;
    address[] public participants;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        participants.push(msg.sender);
    }

    function generateRandom() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, participants)));
    }

    function pickWinner() public payable requireManager {
        uint winnerIndex = generateRandom() % participants.length;
        address payable winner = payable(participants[winnerIndex]);
        winner.transfer(address(this).balance);

        participants = new address[](0);                            //resetting the participants array
    }

    function getEntries() public view returns (address[] memory) {
        return participants;
    }

    modifier requireManager() {
        require(msg.sender == manager);
        _;
    }
}
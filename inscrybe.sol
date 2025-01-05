// Deployed with the Atlas IDE
// https://app.atlaszk.com/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InscriptionContract {
    // Struct to hold inscription data
    struct Inscription {
        string message;
        address writer;
    }

    // Array to hold all inscriptions
    Inscription[] public inscriptions;

    // Mapping to keep track of inscriptions count per wallet
    mapping(address => uint256) public walletInscriptionCount;

    // Mapping to store the last inscription index for each wallet
    mapping(address => uint256) private lastInscriptionIndex;

    // Event to emit when a new inscription is added
    event NewInscription(string message, address indexed writer);

    // Function to add a new inscription
    function addInscription(string memory _message) public {
        inscriptions.push(Inscription(_message, msg.sender));
        uint256 index = inscriptions.length - 1;
        walletInscriptionCount[msg.sender]++;
        lastInscriptionIndex[msg.sender] = index;

        emit NewInscription(_message, msg.sender);
    }

    // Function to get the last inscription
    function getLastInscription() public view returns (string memory) {
        if (inscriptions.length == 0) {
            return "No inscriptions yet";
        }
        return inscriptions[inscriptions.length - 1].message;
    }

    // Function to get the last inscription of a specific wallet
    function getLastInscriptionByWallet(address _wallet) public view returns (string memory) {
        if (walletInscriptionCount[_wallet] == 0) {
            return "No inscriptions for this wallet";
        }
        return inscriptions[lastInscriptionIndex[_wallet]].message;
    }
}

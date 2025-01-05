document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connectWallet');
    const mintButton = document.getElementById('mintButton');
    const inscriptionInput = document.getElementById('inscriptionInput');
    const inscriptionCountElement = document.getElementById('inscriptionCount').querySelector('span');
  
    let web3;
    let inscriptionContract;
    const contractABI = [
  {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "message",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "writer",
          "type": "address"
        }
      ],
      "name": "NewInscription",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_message",
          "type": "string"
        }
      ],
      "name": "addInscription",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLastInscription",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_wallet",
          "type": "address"
        }
      ],
      "name": "getLastInscriptionByWallet",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "inscriptions",
      "outputs": [
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "writer",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "walletInscriptionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  
  ];
      const contractAddresses = {
      '0x5': '0xa8a116840b4349f12a3c0F1C69Fe0B2b97E3B477', // Goerli
      '0xaa36a7': '0xeE0C2eCD7Cb3d9E507A7555C031418ee17594d97', // Sepolia
    };
    inscriptionInput.addEventListener('input', () => {
      if (inscriptionInput.value.length > 320) {
        inscriptionInput.classList.add('limit-exceeded');
        inscriptionInput.value = inscriptionInput.value.substring(0, 320);
      } else {
        inscriptionInput.classList.remove('limit-exceeded');
      }
    });
    
    connectWalletButton.addEventListener('click', async () => {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        // Update button text to show the connected wallet address
        connectWalletButton.textContent = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
        connectWalletButton.disabled = true; // Optional: Disable the button after connecting
      }
      const networkIdHex = await web3.eth.net.getId();
      const contractAddress = contractAddresses[`0x${networkIdHex.toString(16)}`] || '0x';
      inscriptionContract = new web3.eth.Contract(contractABI, contractAddress);
      updateInscriptionCount();
      updateNetworkButton(); // Call this function to update the network button text
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  });
  
  window.ethereum.on('chainChanged', (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complex, so consult the docs for a full implementation.
    updateNetworkButton(chainId); // Update the network button with the new chainId
  
    //updates the contract address upon network chain change
    const contractAddress = contractAddresses[chainId] || '0x';
    inscriptionContract = new web3.eth.Contract(contractABI, contractAddress);
  });
  //updates network and displays on button
  // Simplified function to update the network button text
  async function updateNetworkButton() {
    try {
      const networkId = await web3.eth.net.getId();
      const networkData = {
        '0x1': 'Mainnet',      // Hexadecimal for clarity
        '0x5': 'Goerli',
        '0xaa36a7': 'Sepolia', 
      };
      // Use the hexadecimal networkId to ensure consistency with the event listener
      const networkName = networkData[`0x${networkId.toString(16)}`] || 'Unknown';
      const currentNetworkButton = document.getElementById('currentNetwork');
      currentNetworkButton.textContent = `Network: ${networkName}`;
    } catch (error) {
      console.error('Error fetching network:', error);
    }
  }
  
  // Update network button when chain changes
  window.ethereum.on('chainChanged', updateNetworkButton);
  
  // Toggle dropdown display
  document.getElementById('currentNetwork').addEventListener('click', function(event) {
    document.getElementById('networkList').classList.toggle('show');
  });
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropdown-button')) {
      var dropdowns = document.getElementsByClassName('dropdown-content');
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  };
  
  // Handle network switch when a network is clicked in the dropdown
  document.getElementById('networkList').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    const networkName = event.target.textContent; // Get network name from clicked item
  
    const networkHexIds = {
      'Mainnet': '0x1',
      'Goerli': '0x5',
      'Sepolia': '0xaa36a7', // Make sure this is the correct hex chainId for Sepolia
    };
  
    if (networkName in networkHexIds) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkHexIds[networkName] }],
        });
        // Button text is updated via the chainChanged event listener
      } catch (error) {
        if (error.code === 4902) {
          console.error('This network is not available in your MetaMask, please add it manually.');
        } else {
          console.error('Error switching network:', error);
        }
      }
    }
  });
  
  let linkContainer = document.createElement('div');
  linkContainer.setAttribute('id', 'linkContainer');
  document.getElementById('inscriptionCount').parentElement.appendChild(linkContainer);
  
  mintButton.addEventListener('click', async () => {
    const message = inscriptionInput.value;
    if (message) {
      try {
        const accounts = await web3.eth.getAccounts();
        startLoadingAnimation(); // Start loading animation
        const response = await inscriptionContract.methods.addInscription(message).send({ from: accounts[0] });
        stopLoadingAnimation(); // Stop loading animation after transaction is confirmed
        const txHash = response.transactionHash; // Capture the transaction hash
        displayEtherscanLink(txHash); // Display the Etherscan link only after stopping the animation
        inscriptionInput.value = ''; // Clear input field
        updateInscriptionCount();
      } catch (error) {
        stopLoadingAnimation(); // Stop loading animation if there is an error
        if (error.code === 4001) {
          // User rejected the transaction
          console.log('Transaction rejected by user.');
        } else {
          // Handle other errors
          console.error('Error minting inscription:', error);
        }
      }
    } else {
      alert('Please enter an inscription.');
    }
  });
  
  
  
    async function updateInscriptionCount() {
      try {
        const accounts = await web3.eth.getAccounts();
        const count = await inscriptionContract.methods.walletInscriptionCount(accounts[0]).call();
        inscriptionCountElement.textContent = count;
      } catch (error) {
        console.error('Error updating inscription count:', error);
      }
    }
  });
  
  //Possibly put loading animation inside button on both sides of Mint Inscription
  function displayEtherscanLink(txHash) {
    const etherscanLink = `https://goerli.etherscan.io/tx/${txHash}`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', etherscanLink);
    linkElement.setAttribute('target', '_blank');
    linkElement.textContent = 'View on Etherscan';
    linkElement.classList.add('green-bold-link');
  
    const container = document.getElementById('linkContainer');
    container.appendChild(linkElement);
  }
  
  let loadingInterval;
  function startLoadingAnimation() {
    const container = document.getElementById('linkContainer');
    container.textContent = ''; // Clear the container
    let loadingChars = ['-','\\','|','/'];
    let i = 0;
    loadingInterval = setInterval(() => {
      container.textContent = loadingChars[i++ % loadingChars.length];
    }, 250); // Change the character every 250ms
  }
  
  function stopLoadingAnimation() {
    clearInterval(loadingInterval);
    const container = document.getElementById('linkContainer');
    container.textContent = ''; // Clear the text content of the container
  }
  

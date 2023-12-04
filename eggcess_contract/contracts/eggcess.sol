// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @dev EggcessApp is a smart contract that facilitates the transfer of Ether (ETH) between users based on social media handles.
 */
contract EggcessApp is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable  {
    //address public owner;           // Current owner of the contract
    address public batch;           // Address which updates the To Address for newly onboarded KOLs
    address public appTreasury;     // Address for the app's treasury
    address public globalRaffle;    // Address for the global raffle fund
    uint16 public bpsRevenueShare;         // Basis Points for App Revenue Share, 250 means 2.5%
    uint16 public bpsGlobalRaffle;         // Basis Points for Global Raffle, 250 means 2.5%
    uint16 public bpsToPercentDivider;     // Constant number to convert basis points to percentage = 10,000

    bool public isOwnershipTransferPending;     // Flag to indicate if ownership transfer is pending
    address public pendingOwner;                // Address of the pending owner during ownership transfer
    uint256 public ownershipTransferTimestamp;  // Timestamp for ownership transfer

    // BidData struct stores information about a bid.
    struct BidData {
        address from;              // Sender's address
        address to;                // Receiver's address or owner's address if the receiver's Eggcess profile is not created
        string socialMediaHandle;  // SocialMediaHandle@SocialMedia, example elon@Twitter
        uint256 balance;           // Balance Ether in the bid
    }

    mapping (string => BidData) public bids; // Mapping to store bid data based on a key

    string[] public keys; //For Testing to keep track of all the keys

    // Events to log bid and ownership transfer events
    event SendBid(address indexed from, address indexed to, uint256 amount);
    event WithdrawBid(address indexed from, address indexed to, uint256 amount);
    event RevokeOwnership(address indexed currentOwner, address indexed newOwner) ;
    //event OwnershipTransferred(address indexed previousOwner, address indexed newOwner) ;
    //event OwnershipTransferInitiated(address indexed previousOwner, address indexed newOwner);
    event UpdateToAddress(address indexed owner, address indexed receiverAddress, string socialMediaHandle, address newToAddress);
    event ClaimBalance(address indexed from, address indexed to, uint256 amount);

   
    /**
     * @dev Constructor to initialize the contract with the batch, app's treasury and global raffle addresses.
     * @param _batch which updates the To Address for newly onboarded KOLs
     * @param _appTreasury Address for the app's treasury.
     * @param _globalRaffle Address for the global raffle fund.

     constructor(address _batch, address _appTreasury, address _globalRaffle) {
     */

    function initialize(address _batch, address _appTreasury, address _globalRaffle) public initializer {
        //owner = msg.sender;
        batch = _batch;
        appTreasury = _appTreasury;
        globalRaffle = _globalRaffle;
        bpsRevenueShare = 250;
        bpsGlobalRaffle = 250;
        bpsToPercentDivider = 10000;
        __ReentrancyGuard_init();
        __Ownable_init(msg.sender);
    }

    // Modifier to restrict functions to only the current owner.
    modifier isOwner() {
        require(msg.sender == owner(), "Only the owner can call this function");       
        _;
    }

    // Modifier to restrict functions to only the batch.
    modifier onlyBatch() {
        require(msg.sender == batch, "Only the batch can call this function");
        _;
    }

    // Modifier to restrict functions to only the pending owner during ownership transfer.
    modifier onlyPendingOwner() {
        require(msg.sender == pendingOwner, "Only the pending owner can complete the transfer");
        require(isOwnershipTransferPending, "Ownership transfer is not pending");
        require(block.timestamp >= ownershipTransferTimestamp + 24 hours, "24 hours have not passed");
        _;
    }

    // Modifier to restrict functions to the current owner during the revocation of ownership transfer.
    modifier onlyNotPendingOwner() {
        require(msg.sender != pendingOwner, "Current owner cannot revoke the transfer");
        require(isOwnershipTransferPending, "Ownership transfer is not pending");
        require(block.timestamp < ownershipTransferTimestamp + 24 hours, "24 hours have passed, cannot revoke");
        _;
    }

    /**
     * @dev Function to initiate the ownership transfer to a new owner.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) public override isOwner {
        require(newOwner != address(0), "Invalid new owner address");
        isOwnershipTransferPending = true;
        pendingOwner = newOwner;
        ownershipTransferTimestamp = block.timestamp;
        //emit OwnershipTransferInitiated(msg.sender, newOwner);
        emit OwnershipTransferred(msg.sender, newOwner);
    }

    /**
     * @dev Function to complete the ownership transfer by the pending owner.
     */
    function completeOwnershipTransfer() external onlyPendingOwner {
        //owner = pendingOwner;
        _transferOwnership(pendingOwner);
        isOwnershipTransferPending = false;
        pendingOwner = address(0);
        ownershipTransferTimestamp = 0;        
        //emit OwnershipTransferred(msg.sender, owner);
    }

    /**
     * @dev Function to revoke the ownership transfer by the current owner.
     */
    function revokeOwnershipTransfer() external onlyNotPendingOwner {
        isOwnershipTransferPending = false;
        pendingOwner = address(0);
        ownershipTransferTimestamp = 0;
        emit RevokeOwnership(msg.sender, pendingOwner);
    }

    /**
     * @dev Function to update the batch's address.
     * @param newBatch The new address for the batch.
     */
    function updateBatch(address newBatch) external isOwner {
        require(newBatch != address(0), "Invalid batch address");
        batch = newBatch;
    }

    /**
     * @dev Function to update the app's treasury address.
     * @param newAppTreasury The new address for the app's treasury.
     */
    function updateAppTreasury(address newAppTreasury) external isOwner {
        require(newAppTreasury != address(0), "Invalid app treasury address");
        appTreasury = newAppTreasury;
    }

    /**
     * @dev Function to update the global raffle address.
     * @param newGlobalRaffle The new address for the global raffle fund.
     */
    function updateGlobalRaffle(address newGlobalRaffle) external isOwner {
        require(newGlobalRaffle != address(0), "Invalid global raffle address");
        globalRaffle = newGlobalRaffle;
    }

    /**
     * @dev Function to update the basis points for Revenue Share
     * @param newBpsRevenueShare The new basis points for Revenue Share
     */
    function updateBpsRevenueShare(uint16 newBpsRevenueShare) external isOwner {
        require(newBpsRevenueShare > 0, "Revenue share needs to be more than 0 percent");
        require(newBpsRevenueShare < 10000, "Revenue share needs to be less than 100 percent");
        bpsRevenueShare = newBpsRevenueShare;
    }

    /**
     * @dev Function to update the basis points for Global Raffle
     * @param newBpsGlobalRaffle The new basis points for Global Raffle
     */
    function updateBpsGlobalRaffle(uint16 newBpsGlobalRaffle) external isOwner {
        require(newBpsGlobalRaffle >= 0, "Global raffle needs to be at least 0 percent");
        require(newBpsGlobalRaffle < 10000, "Global raffle needs to be less than 100 percent");
        bpsGlobalRaffle = newBpsGlobalRaffle;
    }

    /**
     * @dev Function for users to send a bid to another user based on their social media handle.
     * @param receiverAddress The address of the receiver or owner's address if the receiver's Eggcess profile is not created.
     * @param socialMediaHandle The social media handle (e.g., Twitter handle) of the receiver.
     */
    function sendBid(address receiverAddress, string memory socialMediaHandle) external payable nonReentrant {
        require(msg.value > 0, "Invalid bid amount");
        require(bytes(socialMediaHandle).length > 0, "Social media handle cannot be empty");

        string memory key = formulateKey(msg.sender, receiverAddress, socialMediaHandle);

        BidData storage bid = bids[key];

        if (bid.from == address(0)) {
            bids[key] = BidData(msg.sender, receiverAddress, socialMediaHandle, 0);

            keys.push(key); //For Testing to keep track of all the keys
        }

        bid.balance += msg.value;
        emit SendBid(msg.sender, bid.to, msg.value);
    }

    /**
     * @dev Function for users to withdraw their unclaimed bid balance.
     * @param receiverAddress The address of the receiver or owner's address if the receiver's Eggcess profile is not created.
     * @param socialMediaHandle The social media handle (e.g., Twitter handle) of the receiver.
     * @param withdrawAmount The amount of Ether to withdraw, can be partial withdrawal  
     */
    function withdrawBid(address receiverAddress, string memory socialMediaHandle, uint256 withdrawAmount) external nonReentrant {
        string memory key = formulateKey(msg.sender, receiverAddress, socialMediaHandle);

        BidData storage bid = bids[key];

        require(bid.from == msg.sender, "Only the sender of the bid can withdraw");
        require(bid.balance > 0, "No balance to withdraw");
        require(bid.balance >= withdrawAmount, "Withdrawal amount is more than balance");

        uint256 appShare = (withdrawAmount * bpsRevenueShare) / bpsToPercentDivider;    // Split to the app treasury
        uint256 raffleShare = (withdrawAmount * bpsGlobalRaffle) / bpsToPercentDivider; // Split to the global raffle
        uint256 userShare = withdrawAmount - appShare - raffleShare;

        bid.balance -= withdrawAmount;
        payable(appTreasury).transfer(appShare);
        payable(globalRaffle).transfer(raffleShare);
        payable(bid.from).transfer(userShare);

        emit WithdrawBid(bid.from, bid.to, userShare);        
    }    

    /**
     * @dev Function for users to claim their bid balance.
     * @param senderAddress The sender address who submitted the bid to the KOL
     * @param socialMediaHandle The social media handle (e.g., Twitter handle) of the receiver.
     */
    function claimBalance(address senderAddress, string memory socialMediaHandle) external nonReentrant {
        string memory key = formulateKey(senderAddress, msg.sender, socialMediaHandle);

        BidData storage bid = bids[key];        

        require(bid.to == msg.sender, "Only the receiver of the bid can claim");
        require(bid.balance > 0, "No balance to claim");

        uint256 amountToClaim = bid.balance;

        uint256 appShare = (amountToClaim * bpsRevenueShare) / bpsToPercentDivider;     // Split to the app treasury
        uint256 raffleShare = (amountToClaim * bpsGlobalRaffle) / bpsToPercentDivider;  // Split to the global raffle
        uint256 userShare = amountToClaim - appShare - raffleShare;
        
        bid.balance = 0;
        payable(appTreasury).transfer(appShare);
        payable(globalRaffle).transfer(raffleShare);
        payable(bid.to).transfer(userShare);        

        emit ClaimBalance(senderAddress, bid.to, amountToClaim);
    }

    /**
     * @dev Function for the batch to update the 'to' address in a bid record when new KOL is onboarded.
     * @param senderAddress The sender address who submitted the bid to the KOL
     * @param receiverAddress The address of the receiver or owner's address if the receiver's Eggcess profile is not created.
     * @param socialMediaHandle The social media handle (e.g., Twitter handle) of the receiver.
     * @param newToAddress The new 'to' address to be set in the bid record.
     */
    function updateToAddress(address senderAddress, address receiverAddress, string memory socialMediaHandle, address newToAddress) external onlyBatch nonReentrant {
        string memory oldKey = formulateKey(senderAddress, receiverAddress, socialMediaHandle);

        BidData storage oldBid = bids[oldKey];
        require(oldBid.from != address(0), "Bid record not found");
        require(oldBid.to == batch, "Only batch is allowed to update the bids' to addresses");
        
        //Create new key with new To Address and using the old Bid's amount
        string memory newkey = formulateKey(senderAddress, newToAddress, socialMediaHandle);

        BidData storage newBid = bids[newkey];
        if (newBid.from == address(0)) {            
            bids[newkey] = BidData(senderAddress, newToAddress, socialMediaHandle, oldBid.balance);
        } else {
            newBid.balance += oldBid.balance;
        }

        //After new key created, nullify old key 
        oldBid.from = address(0);
        oldBid.to = address(0);
        oldBid.socialMediaHandle = "";
        oldBid.balance = 0;

        emit UpdateToAddress(senderAddress, receiverAddress, socialMediaHandle, newToAddress);
        
        keys.push(newkey); //For Testing to keep track of all the keys
    }

    /**
     * @dev Function to formulate a key using Address+Address+Handle
     * @param from From Address
     * @param to To address
     * @param handle Social media handle of the received
     * @return string Formulated key Address+Address+Handle (note the Address is all in lowercase)
     */
    function formulateKey(address from, address to, string memory handle) internal pure returns (string memory) {       
        return string(abi.encodePacked(
                        Strings.toHexString(uint256(uint160(from)), 20), 
                        Strings.toHexString(uint256(uint160(to)), 20), 
                        handle));
    }

    /**
    * @dev Function to get all data from the bids mapping.
    * @return array of keys and corresponding bid data.
    */
    function getAllBidData() external view returns (string[] memory, BidData[] memory) {
        uint256 bidCount = keys.length;        

        string[] memory allKeys = new string[](bidCount);
        BidData[] memory allData = new BidData[](bidCount);

        uint256 index = 0;
        for (uint256 i = 0; i < bidCount; i++) {
            if (bids[keys[i]].from != address(0)) {
                allKeys[index] = keys[i];
                allData[index] = bids[keys[i]];
                index++;
            }
        }

        return (allKeys, allData);
    }

   function getVersion() external  pure returns (string memory) {
    return "V4";
    }

    
}

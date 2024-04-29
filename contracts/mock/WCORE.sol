// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// // @title WNT
// // @dev similar implementation as WETH but since some networks
// // might have a different native token we use WNT for a more general reference name
// contract WNT is ERC20 {
//     constructor() ERC20("Wrapped Native Token", "WNT") {}

//     error TransferFailed(address account, uint256 amount);

//     // @dev mint WNT by depositing the native token
//     function deposit() external payable {
//         _mint(msg.sender, msg.value);
//     }

//     // @dev withdraw the native token by burning WNT
//     // @param amount the amount to withdraw
//     function withdraw(uint256 amount) external {
//         _burn(msg.sender, amount);
//         (bool success, ) = msg.sender.call{ value: amount }("");
//         if (!success) {
//             revert TransferFailed(msg.sender, amount);
//         }
//     }

//     // @dev mint tokens to an account
//     // @param account the account to mint to
//     // @param amount the amount of tokens to mint
//     function mint(address account, uint256 amount) external {
//         _mint(account, amount);
//     }

//     // @dev burn tokens from an account
//     // @param account the account to burn tokens for
//     // @param amount the amount of tokens to burn
//     function burn(address account, uint256 amount) external {
//         _burn(account, amount);
//     }
// }

pragma solidity ^0.4.18;

contract WCORE {
    string public name     = "Wrapped CORE";
    string public symbol   = "WCORE";
    uint8  public decimals = 18;

    event  Approval(address indexed src, address indexed guy, uint wad);
    event  Transfer(address indexed src, address indexed dst, uint wad);
    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);

    mapping (address => uint)                       public  balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;

    function() public payable {
        deposit();
    }
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        Deposit(msg.sender, msg.value);
    }
    function withdraw(uint wad) public {
        require(balanceOf[msg.sender] >= wad);
        balanceOf[msg.sender] -= wad;
        msg.sender.transfer(wad);
        Withdrawal(msg.sender, wad);
    }

    function totalSupply() public view returns (uint) {
        return this.balance;
    }

    function approve(address guy, uint wad) public returns (bool) {
        allowance[msg.sender][guy] = wad;
        Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad)
        public
        returns (bool)
    {
        require(balanceOf[src] >= wad);

        if (src != msg.sender && allowance[src][msg.sender] != uint(-1)) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        Transfer(src, dst, wad);

        return true;
    }
}
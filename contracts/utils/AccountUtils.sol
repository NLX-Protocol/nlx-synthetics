// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../error/Errors.sol";

library AccountUtils {
    function validateAccount(address account) internal pure {
        if (account == address(0)) {
            revert Errors.EmptyAccount();
        }
    }

    function validateReceiver(address receiver) internal pure {
        if (receiver == address(0)) {
            revert Errors.EmptyReceiver();
        }
    }
}

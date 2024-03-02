// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/GlobalReentrancyGuard.sol";
import "../error/ErrorUtils.sol";

import "./ExchangeUtils.sol";
import "../role/RoleModule.sol";
import "../feature/FeatureUtils.sol";

import "../market/Market.sol";
import "../market/MarketToken.sol";

import "../withdrawal/Withdrawal.sol";
import "../withdrawal/WithdrawalVault.sol";
import "../withdrawal/WithdrawalStoreUtils.sol";
import "../withdrawal/WithdrawalUtils.sol";
import "../withdrawal/ExecuteWithdrawalUtils.sol";
import "../oracle/Oracle.sol";
import "../oracle/OracleModule.sol";
import "../utils/MulticallWithValue.sol";

import "./IWithdrawalHandler.sol";

// @title WithdrawalHandler
// @dev Contract to handle creation, execution and cancellation of withdrawals
contract WithdrawalHandler is IWithdrawalHandler, GlobalReentrancyGuard, RoleModule, OracleModule, MulticallWithValue {
    using Withdrawal for Withdrawal.Props;

    EventEmitter public immutable eventEmitter;
    WithdrawalVault public immutable withdrawalVault;
    Oracle public immutable oracle;

    constructor(
        RoleStore _roleStore,
        DataStore _dataStore,
        EventEmitter _eventEmitter,
        WithdrawalVault _withdrawalVault,
        Oracle _oracle
    ) RoleModule(_roleStore) GlobalReentrancyGuard(_dataStore) {
        eventEmitter = _eventEmitter;
        withdrawalVault = _withdrawalVault;
        oracle = _oracle;
    }

    // @dev creates a withdrawal in the withdrawal store
    // @param account the withdrawing account
    // @param params WithdrawalUtils.CreateWithdrawalParams
    function createWithdrawal(
        address account,
        WithdrawalUtils.CreateWithdrawalParams calldata params
    ) external override globalNonReentrant onlyController returns (bytes32) {
        FeatureUtils.validateFeature(dataStore, Keys.createWithdrawalFeatureDisabledKey(address(this)));

        return WithdrawalUtils.createWithdrawal(
            dataStore,
            eventEmitter,
            withdrawalVault,
            account,
            params
        );
    }

    // @dev cancels a withdrawal
    // @param key the withdrawal key
    function cancelWithdrawal(bytes32 key) external override globalNonReentrant onlyController {
        uint256 startingGas = gasleft();

        DataStore _dataStore = dataStore;
        Withdrawal.Props memory withdrawal = WithdrawalStoreUtils.get(_dataStore, key);

        FeatureUtils.validateFeature(_dataStore, Keys.cancelWithdrawalFeatureDisabledKey(address(this)));

        ExchangeUtils.validateRequestCancellation(
            _dataStore,
            withdrawal.updatedAtBlock(),
            "Withdrawal"
        );

        WithdrawalUtils.cancelWithdrawal(
            _dataStore,
            eventEmitter,
            withdrawalVault,
            key,
            withdrawal.account(),
            startingGas,
            Keys.USER_INITIATED_CANCEL,
            ""
        );
    }

    // @dev executes a withdrawal
    // @param key the key of the withdrawal to execute
    // @param oracleParams OracleUtils.SetPricesParams
    function executeWithdrawal(
        bytes32 key,
        OracleUtils.SetPricesParams calldata oracleParams
    )
        external
        payable
        globalNonReentrant
        onlyOrderKeeper
        withOraclePrices(oracle, dataStore, eventEmitter, oracleParams)
    {
        uint256 startingGas = gasleft();

        Withdrawal.Props memory withdrawal = WithdrawalStoreUtils.get(dataStore, key);
        uint256 estimatedGasLimit = GasUtils.estimateExecuteWithdrawalGasLimit(dataStore, withdrawal);
        GasUtils.validateExecutionGas(dataStore, startingGas, estimatedGasLimit);

        // uint256 executionGas = GasUtils.getExecutionGas(dataStore, startingGas);

        try this._executeWithdrawal(
            key,
            withdrawal,
            msg.sender
        ) {
        } catch (bytes memory reasonBytes) {
            _handleWithdrawalError(
                key,
                startingGas,
                reasonBytes
            );
        }
    }
 // @dev executes a withdrawal
    // @param key the key of the withdrawal to execute
    // @param oracleParams OracleUtils.SetPricesParams
    function executeWithdrawalSelf(
        bytes32 key,
        OracleUtils.SetPricesParams calldata oracleParams
    )
        external
        payable
        globalNonReentrant
        onlySelf
        withOraclePrices(oracle, dataStore, eventEmitter, oracleParams)
    {
        uint256 startingGas = gasleft();

        Withdrawal.Props memory withdrawal = WithdrawalStoreUtils.get(dataStore, key);
        uint256 estimatedGasLimit = GasUtils.estimateExecuteWithdrawalGasLimit(dataStore, withdrawal);
        GasUtils.validateExecutionGas(dataStore, startingGas, estimatedGasLimit);

        try this._executeWithdrawal(
            key,
            withdrawal,
            msg.sender
        ) {
        } catch (bytes memory reasonBytes) {
            _handleWithdrawalError(
                key,
                startingGas,
                reasonBytes
            );
        }
    }

    // @dev simulate execution of a withdrawal to check for any errors
    // @param key the withdrawal key
    // @param params OracleUtils.SimulatePricesParams
    function simulateExecuteWithdrawal(
        bytes32 key,
        OracleUtils.SimulatePricesParams memory params
    ) external
        override
        onlyController
        withSimulatedOraclePrices(oracle, params)
        globalNonReentrant
    {

        Withdrawal.Props memory withdrawal = WithdrawalStoreUtils.get(dataStore, key);

        this._executeWithdrawal(
            key,
            withdrawal,
            msg.sender
        );
    }

    // @dev executes a withdrawal
    // @param oracleParams OracleUtils.SetPricesParams
    // @param keeper the keeper executing the withdrawal
    // @param startingGas the starting gas
    function _executeWithdrawal(
        bytes32 key,
        Withdrawal.Props memory withdrawal,
        address keeper
    ) external onlySelf {
        uint256 startingGas = gasleft();

        FeatureUtils.validateFeature(dataStore, Keys.executeWithdrawalFeatureDisabledKey(address(this)));


        ExecuteWithdrawalUtils.ExecuteWithdrawalParams memory params = ExecuteWithdrawalUtils.ExecuteWithdrawalParams(
            dataStore,
            eventEmitter,
            withdrawalVault,
            oracle,
            key,
            keeper,
            startingGas
        );

        ExecuteWithdrawalUtils.executeWithdrawal(params, withdrawal);
    }

    function _handleWithdrawalError(
        bytes32 key,
        uint256 startingGas,
        bytes memory reasonBytes
    ) internal {
        GasUtils.validateExecutionErrorGas(dataStore, reasonBytes);

        bytes4 errorSelector = ErrorUtils.getErrorSelectorFromData(reasonBytes);

        if (
            OracleUtils.isOracleError(errorSelector) ||
            errorSelector == Errors.DisabledFeature.selector
        ) {

            ErrorUtils.revertWithCustomError(reasonBytes);
        }

        (string memory reason, /* bool hasRevertMessage */) = ErrorUtils.getRevertMessage(reasonBytes);

        WithdrawalUtils.cancelWithdrawal(
            dataStore,
            eventEmitter,
            withdrawalVault,
            key,
            msg.sender,
            startingGas,
            reason,
            reasonBytes
        );
    }
}

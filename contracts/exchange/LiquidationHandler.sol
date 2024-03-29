// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseOrderHandler.sol";
import "../utils/MulticallWithValue.sol";

// @title LiquidationHandler
// @dev Contract to handle liquidations
contract LiquidationHandler is BaseOrderHandler, MulticallWithValue {
    using SafeCast for uint256;
    using Order for Order.Props;
    using Array for uint256[];

    constructor(
        RoleStore _roleStore,
        DataStore _dataStore,
        EventEmitter _eventEmitter,
        OrderVault _orderVault,
        Oracle _oracle,
        SwapHandler _swapHandler,
        IReferralStorage _referralStorage
    ) BaseOrderHandler(
        _roleStore,
        _dataStore,
        _eventEmitter,
        _orderVault,
        _oracle,
        _swapHandler,
        _referralStorage
    ) {}

    // @dev executes a position liquidation
    // @param account the account of the position to liquidate
    // @param market the position's market
    // @param collateralToken the position's collateralToken
    // @param isLong whether the position is long or short
    // @param oracleParams OracleUtils.SetPricesParams
    function executeLiquidation(
        address account,
        address market,
        address collateralToken,
        bool isLong,
        OracleUtils.SetPricesParams calldata oracleParams
    ) external
        payable
        globalNonReentrant
        onlyLiquidationKeeper
        withOraclePrices(oracle, dataStore, eventEmitter, oracleParams)
    {
        uint256 startingGas = gasleft();

        bytes32 key = LiquidationUtils.createLiquidationOrder(
            dataStore,
            eventEmitter,
            account,
            market,
            collateralToken,
            isLong
        );

        Order.Props memory order = OrderStoreUtils.get(dataStore, key);

        BaseOrderUtils.ExecuteOrderParams memory params = _getExecuteOrderParams(
            key,
            order,
            msg.sender,
            startingGas,
            Order.SecondaryOrderType.None
        );

        FeatureUtils.validateFeature(params.contracts.dataStore, Keys.executeOrderFeatureDisabledKey(address(this), uint256(params.order.orderType())));

        OrderUtils.executeOrder(params);
    }

    // @dev executes a position liquidation
    // @param account the account of the position to liquidate
    // @param market the position's market
    // @param collateralToken the position's collateralToken
    // @param isLong whether the position is long or short
    // @param oracleParams OracleUtils.SetPricesParams
    function executeLiquidationSelf(
        address account,
        address market,
        address collateralToken,
        bool isLong,
        OracleUtils.SetPricesParams calldata oracleParams
    ) external
        payable
        globalNonReentrant
        onlySelf
        withOraclePrices(oracle, dataStore, eventEmitter, oracleParams)
    {
        uint256 startingGas = gasleft();

        bytes32 key = LiquidationUtils.createLiquidationOrder(
            dataStore,
            eventEmitter,
            account,
            market,
            collateralToken,
            isLong
        );

        Order.Props memory order = OrderStoreUtils.get(dataStore, key);

        BaseOrderUtils.ExecuteOrderParams memory params = _getExecuteOrderParams(
            key,
            order,
            msg.sender,
            startingGas,
            Order.SecondaryOrderType.None
        );

        FeatureUtils.validateFeature(params.contracts.dataStore, Keys.executeOrderFeatureDisabledKey(address(this), uint256(params.order.orderType())));

        OrderUtils.executeOrder(params);
    }
}

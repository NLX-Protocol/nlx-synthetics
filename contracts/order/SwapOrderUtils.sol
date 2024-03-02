// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseOrderUtils.sol";
import "../swap/SwapUtils.sol";
import "../order/OrderStoreUtils.sol";

// @title SwapOrderUtils
// @dev Library for functions to help with processing a swap order
library SwapOrderUtils {
    using Order for Order.Props;
    using Array for uint256[];

    using EventUtils for EventUtils.AddressItems;
    using EventUtils for EventUtils.UintItems;
    using EventUtils for EventUtils.IntItems;
    using EventUtils for EventUtils.BoolItems;
    using EventUtils for EventUtils.Bytes32Items;
    using EventUtils for EventUtils.BytesItems;
    using EventUtils for EventUtils.StringItems;

    // @dev process a swap order
    // @param params BaseOrderUtils.ExecuteOrderParams
    function processOrder(BaseOrderUtils.ExecuteOrderParams memory params) external returns (EventUtils.EventLogData memory) {
        if (params.order.market() != address(0)) {
            revert Errors.UnexpectedMarket();
        }


        (address outputToken, uint256 outputAmount) = SwapUtils.swap(SwapUtils.SwapParams(
            params.contracts.dataStore,
            params.contracts.eventEmitter,
            params.contracts.oracle,
            params.contracts.orderVault,
            params.key,
            params.order.initialCollateralToken(),
            params.order.initialCollateralDeltaAmount(),
            params.swapPathMarkets,
            params.order.minOutputAmount(),
            params.order.receiver(),
            params.order.uiFeeReceiver(),
            params.order.shouldUnwrapNativeToken()
        ));

        EventUtils.EventLogData memory eventData;
        eventData.addressItems.initItems(1);
        eventData.addressItems.setItem(0, "outputToken", outputToken);
        eventData.uintItems.initItems(1);
        eventData.uintItems.setItem(0, "outputAmount", outputAmount);
        return eventData;
    }

}

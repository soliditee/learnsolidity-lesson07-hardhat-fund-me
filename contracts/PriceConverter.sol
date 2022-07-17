// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// @chainlink/contracts is an npm package
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Reference: https://docs.chain.link/docs/ethereum-addresses/
// Kovan Data Feed ETA - USD Address: 0x9326BFA02ADD2366b30bacB125260Af641031331

library PriceConverter {
    // Return the USD price of one ETH, in the same number of decimals as msg.value (decimals = 18)
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // price decimals = 8
        // Reference: https://etherscan.io/address/0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419#readContract
        // we need to add 10 more decimals here
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUSD = (ethAmount * ethPrice) / 1e18;
        return ethAmountInUSD;
    }
}

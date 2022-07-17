const networkConfig = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
}

const developmentChains = ["hardhat", "localhost"]
const MOCK_DECIMALS = 8
const MOCK_ANSWER = 1200 * 10 ** MOCK_DECIMALS

module.exports = {
    networkConfig,
    developmentChains,
    MOCK_DECIMALS,
    MOCK_ANSWER,
}

// Option 1: write a separate function
// async function deployFunc(hre) {
// }
// module.exports.default = deployFunc

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// Option 2: use anonymous function
// module.exports.default = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }

// Option 3: use anonymous function with short synctax for const
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // For localhost, we need to mock the Chainlink contract to get ETH price in USD
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        ethUsdPriceFeedAddress = (await deployments.get("MockV3Aggregator"))
            .address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const fundMeArgs = [ethUsdPriceFeedAddress]
    log(`PriceFeedAddress: ${ethUsdPriceFeedAddress}`)
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: fundMeArgs,
        log: true,
        // @ts-ignore
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log(`Start verifying contract deployed at ${fundMe.address} ...`)
        await verify(fundMe.address, fundMeArgs)
    }
}

module.exports.tags = ["all", "fundme"]

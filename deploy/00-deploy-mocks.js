const { network } = require("hardhat")
const {
    developmentChains,
    MOCK_DECIMALS,
    MOCK_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (developmentChains.includes(network.name)) {
        log(`Local network: ${network.name}! Deploying Mock Contracts`)
        const mockContract = await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [MOCK_DECIMALS, MOCK_ANSWER],
            log: true,
        })
        log("Mocked Deployed!")
        log("---------------------------------------------------")
    } else {
        log(`-- Network: ${network.name} -- Skipping Mock Contracts`)
    }
}

module.exports.tags = ["all", "mocks"]

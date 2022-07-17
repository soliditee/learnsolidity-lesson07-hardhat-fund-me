// @ts-nocheck

const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const ethAmountToSend = ethers.utils.parseEther("0.5")

    beforeEach(async function () {
        await deployments.fixture("all")
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", function () {
        it("Set the aggregator address", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", function () {
        it("Revert if not enough ETH is received", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Please send more than 10 USD worth of Ether"
            )
        })

        it("Add sender to the array of funders", async function () {
            await fundMe.fund({ value: ethAmountToSend })
            const response = await fundMe.funders(0)
            assert.equal(response, deployer)
        })

        it("Update amount funded mapping if ETH is received successfully", async function () {
            await fundMe.fund({ value: ethAmountToSend })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), ethAmountToSend.toString())
        })
    })

    describe("withdraw", function () {
        beforeEach(async function () {
            await fundMe.fund({ value: ethAmountToSend })
        })

        it("Withdraw ETH when there's 1 funder", async function () {
            // Arrange
            const startingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const gasCost = transactionReceipt.gasUsed.mul(
                transactionReceipt.effectiveGasPrice
            )
            const endingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingBalanceFundMe, 0)
            assert.equal(
                startingBalanceFundMe.add(startingBalanceDeployer).toString(),
                endingBalanceDeployer.add(gasCost).toString()
            )
        })

        it("Withdraw ETH when there are multiple funders", async function () {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 5; i++) {
                const fundMeConnected = await fundMe.connect(accounts[i])
                await fundMeConnected.fund({ value: ethAmountToSend })
            }
            const startingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const gasCost = transactionReceipt.gasUsed.mul(
                transactionReceipt.effectiveGasPrice
            )
            const endingBalanceFundMe = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingBalanceDeployer = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingBalanceFundMe, 0)
            assert.equal(
                startingBalanceFundMe.add(startingBalanceDeployer).toString(),
                endingBalanceDeployer.add(gasCost).toString()
            )
            // Make sure the funder array is empty
            await expect(fundMe.funders(0)).to.be.reverted
            // Make sure the mapping is cleared out
            for (let i = 1; i < 5; i++) {
                const accountAddress = accounts[i].address
                assert.equal(
                    await fundMe.addressToAmountFunded(accountAddress),
                    0
                )
            }
        })

        it("Only owner can withdraw ETH", async function () {
            // Arrange
            const attackerAccount = (await ethers.getSigners())[1]
            const fundMeConnected = await fundMe.connect(attackerAccount)
            await expect(
                fundMeConnected.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
    })
})

// @ts-nocheck

const { assert, expect } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          const ethAmountToSend = ethers.utils.parseEther("0.01")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("Allow people to fund", async function () {
              const startingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              await fundMe.fund({ value: ethAmountToSend })
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(
                  endingBalance.toString(),
                  startingBalance.add(ethAmountToSend).toString()
              )
          })

          it("Allow owner to withdraw", async function () {
              const startingBalanceOwner = await fundMe.provider.getBalance(
                  deployer
              )
              const startingBalanceContract = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const transactionResponse = await fundMe.withdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const gasCost = transactionReceipt.gasUsed.mul(
                  transactionReceipt.effectiveGasPrice
              )
              const endingBalanceOwner = await fundMe.provider.getBalance(
                  deployer
              )
              const endingBalanceContract = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalanceContract.toString(), "0")
              assert.equal(
                  endingBalanceOwner.add(gasCost).toString(),
                  startingBalanceOwner.add(startingBalanceContract).toString()
              )
          })
      })

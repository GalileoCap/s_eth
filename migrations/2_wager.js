const Wager = artifacts.require("Wager")

module.exports = async function (deployer, network, accounts) {
	await deployer.deploy(Wager)
	const wager = await Wager.deployed()
}





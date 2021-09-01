const Wager = artifacts.require("Wager")

module.exports = async function (deployer, network, accounts) {
	await deployer.deploy(Wager, 13)
	const wager = await Wager.deployed()
}

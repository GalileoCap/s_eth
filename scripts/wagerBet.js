const cuenta = process.argv[4];
console.log('Cuenta:', cuenta);
const result = process.argv[5];
console.log('Result:', result);

const Wager = artifacts.require("Wager")

module.exports = async function (callback) {
	const accounts = await new web3.eth.getAccounts()
	const wager = await Wager.deployed()

	await wager.placeBet(
		result,
		{
			from: accounts[cuenta],
			value: web3.utils.toWei('1', 'ether') //TODO: Bet more money
		}
	)

	// End function
	callback()
}


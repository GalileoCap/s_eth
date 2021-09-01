const cuenta = process.argv[4];
console.log('Cuenta:', cuenta);

const Wager = artifacts.require("Wager")

module.exports = async function (callback) {
	const accounts = await new web3.eth.getAccounts()
	const wager = await Wager.deployed()

	await wager.placeBet(
		[0, 1, 2],
		{
			from: accounts[cuenta],
			value: web3.utils.toWei('1', 'ether') 
		}
	)
	console.log('Placed bet')

	await wager.startGames()
	console.log('Started games')

	await wager.inputResults([0, 1, 2])
	console.log('Sent results')

	await wager.claimPrize(
		{
			from: accounts[cuenta],
		}
	)
	console.log('Claimed Prize')

	// End function
	callback()
}


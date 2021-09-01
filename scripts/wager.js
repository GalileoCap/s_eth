const cuenta = process.argv[4];
console.log('Cuenta:', cuenta);

const Wager = artifacts.require("Wager")

module.exports = async function (callback) {
	const accounts = await new web3.eth.getAccounts()
	const wager = await Wager.deployed()

	await wager.placeBet(
		[0, 1, 1],
		{
			from: accounts[cuenta],
			value: web3.utils.toWei('1', 'ether') 
		}
	)
	console.log('Placed bet')

	await wager.startGames()
	console.log('Started games')

	const totalPool = await wager.TotalPool()
	console.log('Total pool', parseFloat(web3.utils.fromWei(totalPool, 'ether')))
	const gamePool = await wager.GamePool()
	console.log('Game pool', parseFloat(web3.utils.fromWei(gamePool, 'ether')))

	await wager.inputResults([0, 1, 2])
	console.log('Sent results')

	const prevBalance = await web3.eth.getBalance(accounts[cuenta]);
	console.log('Balance', parseFloat(web3.utils.fromWei(prevBalance, 'ether')))

	await wager.claimPrize(
		{
			from: accounts[cuenta],
		}
	)
	console.log('Claimed Prize')

	const newBalance = await web3.eth.getBalance(accounts[cuenta]);
	console.log('Balance', parseFloat(web3.utils.fromWei(newBalance, 'ether')))
	// End function
	callback()
}


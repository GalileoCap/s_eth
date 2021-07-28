const result = process.argv[4];
console.log('Result:', result);

const Wager = artifacts.require("Wager")

module.exports = async function (callback) {
	const wager = await Wager.deployed()

	await wager.inputResult(
		result,
	)

	// End function
	callback()
}


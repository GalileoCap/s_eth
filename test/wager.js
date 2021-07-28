const Wager = artifacts.require('Wager')

contract('Wager', () => {
	// it('DESCRIPTION', async () => {});
	it('Deploys the contract', async () => {
		const wager = await Wager.deployed();
		console.log(wager.address);
		assert(wager.address !== '');
	});
});

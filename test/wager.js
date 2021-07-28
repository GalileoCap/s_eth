const Wager = artifacts.require('Wager')

async function placeBet(wager, account, money, result) { //U: Places a bet
	const accounts = await new web3.eth.getAccounts()

	await wager.placeBet(
		result,
		{
			from: accounts[account],
			value: web3.utils.toWei(money.toString(), 'ether') //TODO: Bet more money
		}
	)
}

async function accountBalance(account) { //U: Returns how much ETH an account has
	const accounts = await new web3.eth.getAccounts()
	const balance = await web3.eth.getBalance(accounts[account]);
	return web3.utils.fromWei(balance, 'ether');
}

contract('Wager', () => {
	//U: Basic format for a test
	//it('DESCRIPTION', async () => {});
	
	it('Deploys the contract', async () => {
		const wager = await Wager.deployed();
		//console.log(wager.address);
		assert(wager.address !== ''); //A: Fails if the address is an empty string
	});

	it('Bets once', async () => {
		const wager = await Wager.deployed()
		const account = 1;
		const money = 1; //A: 1ETH
		const result = 0; //A: Tie 

		const prevBalance = await accountBalance(account); //A: How much ETH they had before

		await placeBet(wager, account, money, result); //A: Bets

		const newBalance = await accountBalance(account); //A: How much ETH they have now

		assert(newBalance < (prevBalance - money)); //A: Payed the bet and a little of gas
	});
});

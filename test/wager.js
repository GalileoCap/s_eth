const Wager = artifacts.require('Wager')

async function placeBet(wager, account, money, result) { //U: Places a bet
	const accounts = await new web3.eth.getAccounts();

	await wager.placeBet(
		result,
		{
			from: accounts[account],
			value: web3.utils.toWei(money.toString(), 'ether')
		}
	);
}

async function inputResult(wager, result) { 
	await wager.inputResult(result);
}

async function claimPrize(wager, account) {
  const accounts = await new web3.eth.getAccounts();

  await wager.claimPrize(
		{   
      from: accounts[account],
    }   
  );
}

async function accountBalance(account) { //U: Returns how much ETH an account has
	const accounts = await new web3.eth.getAccounts();
	const balance = await web3.eth.getBalance(accounts[account]);
	return web3.utils.fromWei(balance, 'ether');
}

contract('WAGER: Random tests', () => {
	//U: Basic format for a test
	//it('DESCRIPTION', async () => {});
	
	it('Deploys the contract', async () => {
		const wager = await Wager.deployed();
		//console.log(wager.address);
		assert(wager.address !== ''); //A: Fails if the address is an empty string
	});

	it('Bets once', async () => {
		const wager = await Wager.deployed();
		const account = 1;
		const money = 1; //A: 1ETH
		const result = 0; //A: Tie 

		const prevBalance = await accountBalance(account); //A: How much ETH they had before

		await placeBet(wager, account, money, result); //A: Bets

		const newBalance = await accountBalance(account); //A: How much ETH they have now

		assert(newBalance < (prevBalance - money)); //A: Payed the bet and a little of gas
	});

	it('Doesn\'t let you bet twice', async () => {
		const wager = await Wager.deployed();
		const account = 2;
		const money = 1; //A: 1ETH
		const result = 0; //A: Tie 

		await placeBet(wager, account, money, result); //A: Bets the first time

		var Error;
		try {
			await placeBet(wager, account, money, result); //A: Bets for a second time
		} catch (error) {
			Error = error;
		}

		assert.notEqual(Error, undefined, 'Error must be thrown');
		assert.isAbove(Error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
	});
});

contract('WAGER: Full game', () => {
	const Bets = [ //U: List of all bets placed 
		//[account, money, result],
		[1, 1, 0],
		[2, 1, 0], 
		[3, 1, 0],
		[4, 1, 1],
		[5, 1, 2],
		[6, 1, 2],
	];
	const Result = 2; 

	it('Places everybody\'s bets', async () => {
		const wager = await Wager.deployed();

		for (bet of Bets) {
			const prevBalance = await accountBalance(bet[0]); //A: How much ETH they had before
			await placeBet(wager, bet[0], bet[1], bet[2]);
			const newBalance = await accountBalance(bet[0]); //A: How much ETH they have now

			assert(newBalance < (prevBalance - bet[1])); //A: Payed the bet and a little of gas
		}
	});

	it('Inputs the result', async () => {
		const wager = await Wager.deployed();

		const account = 0; //A: Chairperson's account
		const prevBalance = await accountBalance(account); //A: How much ETH they had before
		await inputResult(wager, Result);
		const newBalance = await accountBalance(account); //A: How much ETH they have now

		assert(newBalance > prevBalance); //A: Made money from all the bets
	});

	it('Everyone tries to claim their prizes', async () => {
		const wager = await Wager.deployed();

		for (bet of Bets) {
			if (bet[2] == Result) { //A: They won
				const prevBalance = await accountBalance(bet[0]); //A: How much ETH they had before
				await claimPrize(wager, bet[0]);	
				const newBalance = await accountBalance(bet[0]); //A: How much ETH they have now

				assert(newBalance > prevBalance);
			} else { //A: They lost
				var Error;
				try {
					await claimPrize(wager, bet[0]);	
				} catch (error) {
					Error = error;
				}

				assert.notEqual(Error, undefined, 'Error must be thrown');
				assert.isAbove(Error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
			}
		}
	});
});

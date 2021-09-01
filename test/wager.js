const Wager = artifacts.require('Wager')

async function placeBet(wager, account, money, results) { //U: Places a bet
	const accounts = await new web3.eth.getAccounts();

	await wager.placeBet(
		results,
		{
			from: accounts[account],
			value: web3.utils.toWei(money.toString(), 'ether')
		}
	);
}

async function StartGames(wager) { 
	await wager.startGames();
}

async function inputResults(wager, results) { 
	await wager.inputResults(results);
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
	return parseFloat(web3.utils.fromWei(balance, 'ether'));
}

function wonAtAny(bets, results) {
	let res = false
	for (i in bets) { res |= bets[i] == results[i] }
	return res
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
		const results = [0, 1, 2]; //A: Local, Away, Tie

		const prevBalance = await accountBalance(account); //A: How much ETH they had before

		await placeBet(wager, account, money, results); //A: Bets

		const newBalance = await accountBalance(account); //A: How much ETH they have now

		assert(newBalance < (prevBalance - money)); //A: Payed the bet and a little of gas
	});

	it('Doesn\'t let you bet twice', async () => {
		const wager = await Wager.deployed();
		const account = 2;
		const money = 1; //A: 1ETH
		const results = [0, 1, 2]; //A: Local, Away, Tie 

		await placeBet(wager, account, money, results); //A: Bets the first time

		var Error;
		try {
			await placeBet(wager, account, money, results); //A: Bets for a second time
		} catch (error) {
			Error = error;
		}

		assert.notEqual(Error, undefined, 'Error must be thrown');
		assert.isAbove(Error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
	});
});

contract('WAGER: Full game', () => {
	const Bets = [ //U: List of all bets placed 
		//[account, money, results],
		[1, 1, [0, 1, 2]],
		//[2, 1, 0], 
		//[3, 1, 0],
		//[4, 1, 1],
		//[5, 1, 2],
		//[6, 1, 2],
	];
	const lateBet = [5, 1, [0, 1, 2]]; //A: Someone who hasn't bet yet
	const Results = [0, 1, 2]; 

	it('Places everybody\'s bets', async () => {
		const wager = await Wager.deployed();

		for (bet of Bets) {
			const prevBalance = await accountBalance(bet[0]); //A: How much ETH they had before
			await placeBet(wager, bet[0], bet[1], bet[2]);
			const newBalance = await accountBalance(bet[0]); //A: How much ETH they have now

			assert(newBalance < (prevBalance - bet[1])); //A: Payed the bet and a little of gas
		}
	});

	it('Starts the games', async () => {
		const wager = await Wager.deployed();
		const account = 0; //A: Chairperson's account

		await StartGames(wager);
	})

	it('Someone tries to bet late', async () => {
		const wager = await Wager.deployed();

		var Error;
		try {
			await placeBet(wager, lateBet[0], lateBet[1], lateBet[2]); //A: Bets for a second time
		} catch (error) {
			Error = error;
		}

		assert.notEqual(Error, undefined, 'Error must be thrown');
		assert.isAbove(Error.message.search('VM Exception while processing transaction: revert'), -1);
	})

	it('Inputs the result', async () => {
		const wager = await Wager.deployed();

		const account = 0; //A: Chairperson's account
		const prevBalance = await accountBalance(account); //A: How much ETH they had before
		await inputResults(wager, Results);
		const newBalance = await accountBalance(account); //A: How much ETH they have now

		assert(newBalance > prevBalance); //A: Made money from all the bets
	});

	it('Everyone tries to claim their prizes', async () => {
		const wager = await Wager.deployed();

		for (bet of Bets) {
			const prevBalance = await accountBalance(bet[0]); //A: How much ETH they had before

			var Error;
			try {
				await claimPrize(wager, bet[0]); //A: They can't claim anything	
			} catch (error) {
				Error = error;
			}

			const newBalance = await accountBalance(bet[0]); //A: How much ETH they have now

			if (wonAtAny(bet[2], Results)) { //A: They won
				assert.equal(Error, undefined);
				assert.isAbove(newBalance, prevBalance);
			} else { //A: They lost
				//assert.equal(newBalance, prevBalance)
				assert.notEqual(Error, undefined, 'Error must be thrown');
				assert.isAbove(Error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
			}
		}
	});
});

contract('WAGER: Full game 0, 1, 2, 3', () => {
	const Bets = [ //U: List of all bets placed 
		//[account, money, results, prize],
		[1, 1, [1, 0, 0]], //A: 0 games correct
		[2, 1, [0, 2, 0]], //A: 1 game correct
		[3, 1, [0, 1, 0]], //A: 2 games correct
		[4, 1, [0, 1, 2]], //A: All games correct
	];
	let Prizes = []
	const Results = [0, 1, 2]; 

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
		await StartGames(wager);
		await inputResults(wager, Results);
		const newBalance = await accountBalance(account); //A: How much ETH they have now

		assert(newBalance > prevBalance); //A: Made money from all the bets
	});

	it('Everyone tries to claim their prizes', async () => {
		const wager = await Wager.deployed();

		for (bet of Bets) {
			const prevBalance = await accountBalance(bet[0]); //A: How much ETH they had before

			var Error;
			try {
				await claimPrize(wager, bet[0]); //A: They can't claim anything	
			} catch (error) {
				Error = error;
			}

			const newBalance = await accountBalance(bet[0]); //A: How much ETH they have now

			Prizes.push(newBalance - prevBalance)

			if (wonAtAny(bet[2], Results)) { //A: They won
				assert.equal(Error, undefined);
				assert.isAbove(newBalance, prevBalance);
			} else { //A: They lost
				//assert.equal(newBalance, prevBalance)
				assert.notEqual(Error, undefined, 'Error must be thrown');
				assert.isAbove(Error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
			}
		}
	});

	it('Some got more than others', async () => {
		for (let i = 1; i < Bets.length; i++) {
			assert.isAbove(Prizes[i], Prizes[i - 1])
		}
	})
});

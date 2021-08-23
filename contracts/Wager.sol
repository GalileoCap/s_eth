// ADAPTED FROM: https://docs.soliditylang.org/en/v0.8.4/solidity-by-example.html
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title Voting with delegation.

contract Wager {
	address payable public Chairperson;
	
	bool public Started = false; //U: If the games have started 
	bool public Done = false; //U: If the game has already been played, and money can be extracted

	uint256 public TotalPool = 0; //U: Total pool of money

	uint[3][13] public Games; //U: List of games with the number of votes for each result
	uint[13] public Results; //U: Results for each game (0 local, 1 away, 2 tie)

	struct Bettor {
		uint[13] votes; //U: Predicted result for the games (0 local, 1 away, 2 tie)
		uint[2] doubles; //U: Games marked as double
		bool voted; //TODO: Let them vote more than once
		bool extracted; //U: Only let them extract once
	}
	mapping(address => Bettor) bettors;

	constructor() {
		Chairperson = payable(msg.sender);
	}
	
	function placeBet(uint[13] calldata votes, uint[2] calldata doubles) public payable { //U: Place a bet
		Bettor storage bettor = bettors[msg.sender];

		require(msg.value > 0, "No seas raton");
		require(!bettor.voted, "TODO: Vote more than once");
		require(!Started, "The games have already started"); 
		require(!Done, "The games are already done");

		bettor.votes = votes;
		bettor.doubles = doubles;
		bettor.voted = true;
		bettor.extracted = false;

		TotalPool += msg.value;

		for (uint game = 0; game < Games.length; game++) { //TODO: Is it more efficient to separate this loop in the 13 games?
			if (doubles[0] == game || doubles[1] == game) { //A: Is marked as a double
				Games[game][votes[game]] += 2;
			} else {
				Games[game][votes[game]]++;
			}
		}
	}

	function startGames() public {
		require(msg.sender == Chairperson, "Only the chairperson can set the games as started");
		require(!Started, "The games have already started");
		require(!Done, "The games are already done");

		Started = true;
	}

	function inputResults(uint[13] calldata results) public { //U: Input the results and allow winners to extract their money
		require(msg.sender == Chairperson, "Only the chairperson can input results");
		require(Started, "The games haven't started yet"); //TODO: Should I be checking for this?
		require(!Done, "You've already input the results");

		Results = results;
		Done = true;

		uint256 forChair = TotalPool * 500 / 10000; //A: 5% for the chairperson
		TotalPool -= forChair;
		Chairperson.transfer(forChair);
	}

	function claimPrize() public { //U: Let the winners extract their prize
		Bettor storage bettor = bettors[msg.sender];
		
		require(Started, "The games haven't started yet");
		require(Done, "The games aren't done yet");
		require(!bettor.extracted, "You've already extracted");

		uint256 forWinner = 0;
		for (uint game = 0; game < Results.length; game++) {
			uint256 thisGame = 0;
			if (bettor.votes[game] == Results[game]) { //A: They got this one right
				thisGame =
					TotalPool * 769 / 10000 //A: 1/13th of the pool for each game
					/ Games[game][Results[game]]; //A: 1/guesses for this result

				if (bettor.doubles[0] == game || bettor.doubles[1] == game) { //A: They marked it as a double
					thisGame *= 2;
				}
			}

			forWinner += thisGame;
		}

		bettor.extracted = true; //A: Set it before transfering so that they can't 
		payable(msg.sender).transfer(forWinner);
	}
}

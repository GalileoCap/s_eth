// ADAPTED FROM: https://docs.soliditylang.org/en/v0.8.4/solidity-by-example.html
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title Voting with delegation.

contract Wager {
	address payable public Chairperson;
	
	bool public Started = false; //U: If the games have started 
	bool public Done = false; //U: If the game has already been played, and money can be extracted

	uint256 public TotalPool = 0; //U: Total pool of money
	uint256 public GamePool = 0; //U: Equal parts of the total pool for each game 

	struct Game {
		uint[3] votes; //U: Votes for each result (0 local, 1 away, 2 tie)
		uint result; //U: Result for the game (0 local, 1 away, 2 tie)
	}
	Game[] public Games; //U: List of games with the number of votes for each result

	function Test() public view returns (Game[] memory) {
		return Games;
	}

	struct Bettor {
		uint[] votes; //U: Predicted result for the games (0 local, 1 away, 2 tie)
		bool voted; //TODO: Let them vote more than once
		bool extracted; //U: Only let them extract once
	}
	mapping(address => Bettor) bettors;

	constructor(uint TotalGames) {
		Chairperson = payable(msg.sender);

		for (uint i = 0; i < TotalGames; i++) { //A: Fill the Games array TODO: There's got to be a faster way
			Game memory game;
			Games.push(game);
		}
	}
	
	function placeBet(uint[] calldata votes) public payable { //U: Place bets
		Bettor storage bettor = bettors[msg.sender];

		require(votes.length == Games.length, "Invalid length");
		require(msg.value > 0, "No seas raton"); //TODO: Set minimum price
		require(!bettor.voted, "TODO: Vote more than once");
		require(!Started, "The games have already started");
		require(!Done, "The games are already done, you should try extracting");

		bettor.votes = votes;
		bettor.voted = true;

		TotalPool += msg.value;

		for (uint i = 0; i < Games.length; i++) {
			Games[i].votes[votes[i]]++;
		}
	}

	function startGames() public { //U: Marks the games a started TODO: Automatize with a date
		require(msg.sender == Chairperson, "Only the chairperson can set the games as started");
		require(!Started, "The games have already started");
		require(!Done, "The games are already done");

		Started = true;

		GamePool = TotalPool / (uint256(Games.length));
	}

	function inputResults(uint[] calldata results) public { //U: Input the results and allow winners to extract their money
		require(results.length == Games.length, "Invalid length");
		require(msg.sender == Chairperson, "Only the chairperson can input results");
		require(Started, "The games haven't started yet"); //TODO: Should I be checking for this?
		require(!Done, "You've already input the results");

		Done = true;

		for (uint i = 0; i < Games.length; i++) {
			Games[i].result = results[i];
		}

		//TODO: Move this transfer to when they place a bet
		uint256 forChair = TotalPool * 500 / 10000; //A: 5% for the chairperson
		TotalPool -= forChair;
		Chairperson.transfer(forChair);
	}

	function claimPrize() public { //U: Let the winners extract their prize
		Bettor storage bettor = bettors[msg.sender];
		
		require(Started, "The games haven't started yet"); //TODO: Should I be checking for this?
		require(Done, "The games aren't done yet");
		require(bettor.voted, "You didn't participate");
		require(!bettor.extracted, "You've already extracted");

		uint256 prize = 0;
		for (uint i = 0; i < Games.length; i++) {
			uint result = Games[i].result;
			uint otherVotes = Games[i].votes[result];
			if (bettor.votes[i] == result) { //A: They got this one right
				prize += GamePool / uint256(otherVotes); //A: 1/guesses for this result
				//A: It's not dividing by zero because AT LEAST this person voted for this result
			}
		}

		bettor.extracted = true; //A: Set it before transfering so that they can't send a request again
		payable(msg.sender).transfer(prize);
	}
}

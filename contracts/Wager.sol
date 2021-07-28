// ADAPTED FROM: https://docs.soliditylang.org/en/v0.8.4/solidity-by-example.html
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title Voting with delegation.

contract Wager {
	address payable public Chairperson;
	
	uint public Result; //U: Result of the game (0 local, 1 away, 2 tie)
	uint256 public TotalPool = 0; //U: Total pool of money
	uint256[3] public ResultPool = [0, 0, 0]; //U: Pool of money for each possible result
	bool public Done = false; //U: If the game has already been played, and money can be extracted

	struct Bettor {
		uint256 size; //U: Amount of money this person put in 
		uint vote; //U: Predicted result for this game (0 local, 1 away, 2 tie)
		bool voted; //TODO: Let them vote more than once
	}
	mapping(address => Bettor) bettors;

	constructor() {
		Chairperson = payable(msg.sender);
	}
	
	function placeBet(uint vote) public payable { //U: Place a bet
		Bettor storage bettor = bettors[msg.sender];

		require(msg.value > 0, "No seas raton");
		require(vote < 3, "Predicted result outside of range");
		require(!bettor.voted, "TODO: Vote more than once");
		require(!Done, "The game is already done");

		bettor.size = msg.value;
		bettor.vote = vote;
		bettor.voted = true;

		TotalPool += msg.value;
		ResultPool[vote] += msg.value;
	}

	function inputResult(uint result) public { //U: Input a result and allow winners to extract their money
		require(msg.sender == Chairperson, "Only the chairperson can input results");
		require(!Done, "You've already input a result");

		Result = result;
		Done = true;

		uint256 forChair = TotalPool * 500 / 10000; //A: 5% for the chairperson
		TotalPool -= forChair; //A: Primero restar para evitar que chairperson vuelva a pedir la transferencia
		Chairperson.transfer(forChair);
	}

	function claimPrize() public { //U: Let the winners extract their part
		Bettor storage bettor = bettors[msg.sender];
		
		require(Done, "You must wait until the game is done");
		require(bettor.voted && (bettor.vote == Result), "Better luck next time");

		uint256 forWinner = TotalPool * bettor.size / ResultPool[bettor.vote]; //A: % of the pool based on how much they bet
		payable(msg.sender).transfer(forWinner);
	}
}

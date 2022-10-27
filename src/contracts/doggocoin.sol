pragma solidity ^0.5.0;

import "./Token.sol";

contract doggocoin {
    string public name="doggocoin decentralised exchange";
    Token public token;
    uint public rate=100; //1ETH==100DGC

    event TokensPurchased(
        address account, 
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account, 
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public{
        token=_token;
    }

    function buyTokens() public payable {
        //Amt of ETH*redemption rate; redemption rate=no of tokens they receive for 1 ETH
        //Calc no of tokens to buy
        uint tokenAmount=msg.value * rate;

        //if user tries to purchase more tokens than available in exchange
        require(token.balanceOf(address(this))>=tokenAmount);

        //transfer tokens to user
        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public{
        //user cant sell more tokens than they have (erc-20 alr does this but for requirement sake)
        require(token.balanceOf(msg.sender)>=_amount);


        //calc amt of eth to redeem
        uint etherAmount=_amount/rate;

        //require doggocoin has enough eth
        require (address(this).balance>=etherAmount);

        //perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        //emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);

    }
}
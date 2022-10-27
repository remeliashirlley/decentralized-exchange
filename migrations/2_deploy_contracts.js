const Token = artifacts.require("Token");
const doggocoin = artifacts.require("doggocoin");

module.exports = async function(deployer) {
  //deploy token
  await deployer.deploy(Token);
  const token=await Token.deployed()

  //deploy doggocoin
  await deployer.deploy(doggocoin, token.address);
  const doggo_coin=await doggocoin.deployed()

  await token.transfer(doggo_coin.address,'1000000000000000000000000')
};

const { assert } = require('chai');

const Token=artifacts.require('Token')
const doggocoin=artifacts.require('doggocoin')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether');
}

contract('doggocoin', ([deployer,investor]) => {
    let token, doggo_coin

    before(async()=>{
        token=await Token.new()
        doggo_coin=await doggocoin.new(token.address)
        await token.transfer(doggo_coin.address,tokens('1000000'))
    })

    describe('Token deployment', async()=> {
        it('contract has a name', async()=>{
            const name=await token.name()
            assert.equal(name, 'doggocoin')
        })
    })


    describe('doggocoin deployment', async()=> {
        it('contract has a name', async()=>{
            const name=await doggo_coin.name()
            assert.equal(name, 'doggocoin decentralised exchange')
        })

        it('contract has tokens', async()=>{
            let balance=await token.balanceOf(doggo_coin.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async()=>{
        let result

        before(async()=>{
            result=await doggo_coin.buyTokens({ from: investor, value: web3.utils.toWei('1','ether')})
        })
        it('Allows user to instantly buy tokens from doggo_coin for fixed price', async() => {
            let investorBalance=await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            let doggo_coinBalance
            doggo_coinBalance=await token.balanceOf(doggo_coin.address)
            assert.equal(doggo_coinBalance.toString(), tokens('999900'))
            doggo_coinBalance=await web3.eth.getBalance(doggo_coin.address)
            assert.equal(doggo_coinBalance.toString(), web3.utils.toWei('1', 'ether'))

            const event=result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

        })
    })

    describe('sellTokens()', async()=>{
        let result

        before(async()=>{
            await token.approve(doggo_coin.address, tokens('100'), {from:investor})
            result=await doggo_coin.sellTokens(tokens('100'), {from:investor})
        })
        it('Allows user to instantly sell tokens to doggo_coin for fixed price', async() => {
            let investorBalance=await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            let doggo_coinBalance
            doggo_coinBalance=await token.balanceOf(doggo_coin.address)
            assert.equal(doggo_coinBalance.toString(), tokens('1000000'))
            doggo_coinBalance=await web3.eth.getBalance(doggo_coin.address)
            assert.equal(doggo_coinBalance.toString(), web3.utils.toWei('0', 'ether'))

            const event=result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //test for failure: investor cant sell more tokens than they have
            await doggo_coin.sellTokens(tokens('500'), {from:investor}).should.be.rejected;
        })
    })


})
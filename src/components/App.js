import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import doggocoin from '../abis/doggocoin.json'
import Navbar from './Navbar'
import Main from './main'
import './App.css'

class App extends Component {

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData(){
    const web3=window.web3

    const accounts=await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    
    const ethBalance=await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance})

    //load token
    const networkId=await web3.eth.net.getId()
    const tokenData=Token.networks[networkId]
    if (tokenData){
      const token=new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({token})
      let tokenBalance=await token.methods.balanceOf(this.state.account).call()
      this.setState({tokenBalance:tokenBalance.toString()})
    } else{
      window.alert('Token contract not deployed to detected network.')
    }

    //load doggocoin
    const doggo_coinData=doggocoin.networks[networkId]
    if (doggo_coinData){
      const doggo_coin=new web3.eth.Contract(doggocoin.abi, doggo_coinData.address)
      this.setState({doggo_coin})
    } else{
      window.alert('doggocoin contract not deployed to detected network.')
    }
    this.setState({loading:false})
  }

  async loadWeb3(){
    if (window.ethereum){
      window.web3=new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3){
      window.web3=new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.doggo_coin.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.doggo_coin.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.doggo_coin.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props){
    super(props)
    this.state={
      account:'',
      token:{},
      doggo_coin:{},
      ethBalance:'0',
      tokenBalance:'0',
      loading:true
    }
  }

  render() {
    let content
    if (this.state.loading){
      content=<p id='loader' className='text-center'>Loading...</p>
    }else{
      content= <Main 
        ethBalance={this.state.ethBalance} 
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth:'600px'}}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

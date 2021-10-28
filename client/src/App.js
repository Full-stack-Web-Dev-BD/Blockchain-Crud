import React, { useEffect, useRef, useState } from 'react'
import Web3 from 'web3'
import { create } from 'ipfs-http-client'
import Navbar from './Nav'
const ipfs = create('https://ipfs.infura.io:5001/api/v0')

const App = () => {
    const [loading, setLoading] = useState(true)
    const [accounts, setAccounts] = useState([])
    const testContract = useRef(null)
    const [file, setFile] = useState(null)
    const [posts, setPosts] = useState([])
    const [index, setIndex] = useState()
    const [balance, setBalance] = useState()
    useEffect(async () => {
        const web3 = new Web3("http://localhost:7545")
        const accounts = await web3.eth.getAccounts()
        setAccounts(accounts)
        const networkId = await web3.eth.net.getId()
        const networkData = require('./abi.json').networks[networkId]
        if (networkData) {
            testContract.current = new web3.eth.Contract(require('./abi.json').abi, networkData.address)
            let postCount = await testContract.current.methods.index().call()
            let balance = await web3.eth.getBalance(accounts[0]);
            setBalance(web3.utils.fromWei(balance))
            setIndex(postCount)
            let allPost = []
            for (let i = 1; i <= postCount; i++) {
                let p = await testContract.current.methods.images(i).call()
                allPost.push(p)
            }
            setPosts(allPost)
        } else {
            alert("Smart Connection failed !! ")

        }
    }, [])

    async function uploadImage() {
        let uploadedFile = await ipfs.add(file)
        let dc = window.prompt('Please Enter Details')
        testContract.current.methods.uploadImage(uploadedFile.path, dc).send({ from: accounts[0], gas: 3000000 }).on('transactionHash', async (hash) => {
            window.location.reload()
        })
    }

    return (
        <>
            <div>
                <Navbar balance={balance} postCount={index} />
                <div className="mt-4 col-md-8 offset-md-2 mt-5 pt-5 ">
                    <div className="mt-3 card    ">
                        <h3 className="alert alert-success p-2">Create a new post </h3>
                        <div className="p-5 pt-1">
                            {
                                file ?
                                    <button className="btn btn-info " onClick={e => uploadImage()} >Upload  :{file.name}  </button> :
                                    <input type="file" onChange={e => setFile(e.target.files[0])} />
                            }
                        </div>
                    </div>
                    <div className="mt-5">
                        <h5>All Post </h5>
                        <hr />
                        <div className=" ">
                            {
                                posts.map(el => {
                                    return (
                                        <div className="card  p-2    mt-2 " >
                                            <p> Title :  {el.description} </p>
                                            <div className="text-center">
                                                <img style={{ width: "500px" }} src={`https://ipfs.infura.io/ipfs/${el.path}`} />
                                            </div>
                                            <div className="card-footer">
                                                <button className="btn btn-sm btn-success mt-2" > Make  a Tip ! </button>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App

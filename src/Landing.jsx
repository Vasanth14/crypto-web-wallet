import React from 'react'
import Header from './components/Header'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div>
        <Header />
        <section className='landingbanner'>
            <Container>
            <div className='mobshow text-center'>
            <span className='xdevs'>100xDevs</span>
            </div>
            <div className='bannecontent text-center mt-5'>
                <p className='content'><span className='bannercontentbg'>WEB BASED SOLANA CRYPTO WALLET</span></p>
            </div>
            <div className='bannertitle text-center my-5'>
                <h2>Your Trusted Cryptocurrency<br /> Wallet</h2>
                <span className='xdevs'>100xDevs</span>
            </div>
            <div className='bannerbtns text-center'>
                <Link to="/createwallet" className='mx-5 btn sitebtn'>Create Wallet</Link>
                <Link to='/importwallet' className='mx-5 btn sitebtn'>Import Wallet</Link>
            </div>
            </Container>
        </section>
    </div>
  )
}

export default Landing
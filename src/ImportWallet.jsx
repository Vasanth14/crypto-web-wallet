// ImportWallet.js
import React, { useState } from 'react';
import { mnemonicToSeed } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { Button, Container, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Header from './components/Header';

const ImportWallet = () => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [importWallets, setImportWallets] = useState([])

  const importWallet = async (mnemonic) => {
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/501'/0'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);
      setPublicKey(keypair.publicKey);

      // Retrieve existing public keys from local storage
      const storedPublicKeys = localStorage.getItem('publicKeys');
      let publicKeys = [];
      if (storedPublicKeys) {
        publicKeys = JSON.parse(storedPublicKeys);
      }

      // Add the new public key to the array
      publicKeys.push(keypair.publicKey);

      // Store the updated array back in local storage
      localStorage.setItem('publicKeys', JSON.stringify(publicKeys));
    } catch (error) {
      console.error("Failed to import wallet:", error);
    }
  };

  const handleImportWallet = async (event) => {
    event.preventDefault();
    await importWallet(seedPhrase);
  };

  return (
    <>
      <Header />
      <section className='userpanelsection'>
        <Container>
          <div className='formboxbg'>
            <Form onSubmit={handleImportWallet}>
              <Form.Group className="mb-3" controlId="formGridAddress1">
                <Form.Label>Seed Phrase</Form.Label>
                <Form.Control type="text" value={seedPhrase} onChange={(event) => setSeedPhrase(event.target.value)} placeholder="Enter your seed phrase" />
              </Form.Group>
              {/* <input type="text" value={seedPhrase} onChange={(event) => setSeedPhrase(event.target.value)} placeholder="Enter seed phrase" /> */}
              <div className='text-center mt-4'>
                <Button className='btn sitebtn' type="submit">Import Wallet</Button>
              </div>
            </Form>
            {publicKey && (
              <div className='mt-4 impwallet text-center'>
                <p className='content '>Public Key: {publicKey.toBase58()}</p>
                <p className=' content'>Your wallet has been imported</p>
                <Link to='/createwallet' className='btn sitebtn'>My Wallets</Link>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default ImportWallet;
import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { generateMnemonic } from "bip39";
import SolanaWallet from './components/SolanaWallet';
import CryptoJS from 'crypto-js';
import Header from './components/Header';

const Home = () => {
    const [mnemonic, setMnemonic] = useState('');
    const [seedPhrase, setSeedPhrase] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [encryptedSeedPhrase, setEncryptedSeedPhrase] = useState('');
    const [decryptedSeedPhrase, setDecryptedSeedPhrase] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPasswordSet, setIsPasswordSet] = useState(false);

    useEffect(() => {
        const encryptedSeedPhrase = localStorage.getItem('encrypted_seed_phrase');
        const isPasswordSet = localStorage.getItem('is_password_set');
        if (isPasswordSet === 'true') {
            setIsPasswordSet(true);
        }
        if (encryptedSeedPhrase) {
            setEncryptedSeedPhrase(encryptedSeedPhrase);
        }
    }, []);

    const createSeedPhrase = async () => {
        const phrase = await generateMnemonic();
        setMnemonic(phrase);
        if (!isPasswordSet) {
            setIsPasswordSet(false);
        }
    };

    const encryptSeedPhrase = (seedPhrase, password) => {
        return CryptoJS.AES.encrypt(seedPhrase, password).toString();
    };

    const decryptSeedPhrase = (encryptedSeedPhrase, password) => {
        const decrypted = CryptoJS.AES.decrypt(encryptedSeedPhrase, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
    };

    const setPasswordHandler = () => {
        if (password === confirmPassword) {
            const encryptedPhrase = encryptSeedPhrase(mnemonic, password);
            setEncryptedSeedPhrase(encryptedPhrase);
            localStorage.setItem('encrypted_seed_phrase', encryptedPhrase);
            localStorage.setItem('is_password_set', 'true');
            setIsPasswordSet(true);
        } else {
            alert('Passwords do not match');
        }
    };

    const authenticate = () => {
        const decryptedSeedPhrase = decryptSeedPhrase(encryptedSeedPhrase, password);
        if (decryptedSeedPhrase) {
            setDecryptedSeedPhrase(decryptedSeedPhrase);
            setIsAuthenticated(true);
        } else {
            alert('Invalid password');
        }
    };

    return (
        <>
            <Header />
            <section className='userpanelsection'>
                <Container>
                    <div className='formboxbg'>
                        {isPasswordSet ? (
                            isAuthenticated ? (
                                <div>
                                    {/* Render authenticated content here */}
                                    <SolanaWallet mnemonic={decryptedSeedPhrase} />
                                </div>
                            ) : (
                                <div>
                                    <Form>
                                        <Form.Group as={Col} controlId="formGridEmail">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                                        </Form.Group>
                                        <div className='text-center my-3'>
                                            <Button className='btn sitebtn' onClick={authenticate}>
                                                Authenticate
                                            </Button>
                                        </div>
                                    </Form>
                                    {/* <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" /> */}
                                    {/* <Button onClick={authenticate}>
                            Authenticate
                        </Button> */}
                                </div>
                            )
                        ) : (
                            <div className=''>
                                <Form>
                                    <div className='text-center'>
                                        <Button className='btn sitebtn' onClick={createSeedPhrase}>
                                            Create Seed Phrase
                                        </Button>
                                    </div>
                                    <Form.Group className="mb-3" controlId="formGridAddress1">
                                        <Form.Label>Seed Phrase</Form.Label>
                                        <Form.Control value={mnemonic} placeholder="Your Seed Phrase" />
                                    </Form.Group>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formGridEmail">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" type="password" />
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="formGridPassword">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" type="password" />
                                        </Form.Group>
                                    </Row>
                                    <div className='text-center'>
                                        <Button className='btn sitebtn' onClick={setPasswordHandler}>
                                            Set Password
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default Home;
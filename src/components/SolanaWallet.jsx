import { useEffect, useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Button, Table, Modal, Form, Image } from "react-bootstrap";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import success from '../../public/success.png'
import solimg from '../../public/sol.png'

const SolanaWallet = ({ mnemonic }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [keypairs, setKeypairs] = useState([]);
    const [balances, setBalances] = useState([]);
    const [show, setShow] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [selectedKeypair, setSelectedKeypair] = useState(null);
    const [receieveAddress, setRecieveAddress] = useState('')

    const [showSuccess, setshowSuccess] = useState(false)
    const [showKey, setShowKey] = useState(false)

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const handleShowRecieve = (address) => {
        setRecieveAddress(address)
        setShowKey(true)
    }

    const handleClose = () => setShow(false);
    const handleShow = (keypair) => {
        setSelectedKeypair(keypair);
        setShow(true);
    };

    const handleCloseKey = () => {
        setShowKey(false)
    }
    const handleShowKey = () => {
        setShowKey(true)
    }
    const handleShowSuccess = () => {
        setshowSuccess(true)
    }
    const handleCloseSuccess = () => {
        setshowSuccess(false)
    }


    useEffect(() => {
        const storedKeypairs = localStorage.getItem('keypairs');
        if (storedKeypairs) {
            const parsedKeypairs = JSON.parse(storedKeypairs).map(({ publicKey, secretKey }) => {
                const pubKey = new PublicKey(publicKey);
                const secKey = Uint8Array.from(Object.values(secretKey));
                return Keypair.fromSecretKey(secKey);
            });
            setKeypairs(parsedKeypairs);
        }
    }, []);

    const createWallet = async () => {
        if (!mnemonic) {
            console.error("Mnemonic not provided!");
            return;
        }

        try {
            const seed = await mnemonicToSeed(mnemonic);
            const path = `m/44'/501'/${currentIndex}'/0'`;
            const derivedSeed = derivePath(path, seed.toString("hex")).key;
            const keypair = Keypair.fromSeed(derivedSeed);
            setCurrentIndex(currentIndex + 1);
            const newKeypairs = [...keypairs, keypair];
            setKeypairs(newKeypairs);
            localStorage.setItem('keypairs', JSON.stringify(newKeypairs.map(kp => ({
                publicKey: kp.publicKey.toBase58(),
                secretKey: Array.from(kp.secretKey),
            }))));
        } catch (error) {
            console.error("Failed to create wallet:", error);
        }
    };

    const fetchBalance = async () => {
        const newBalances = await Promise.all(
            keypairs.map(async (kp) => {
                try {
                    const balance = await connection.getBalance(kp.publicKey);
                    return balance;
                } catch (error) {
                    console.error("Error fetching balance for:", kp.publicKey.toBase58(), error);
                    return 0; // Return 0 if there's an error
                }
            })
        );
        setBalances(newBalances);
    };

    useEffect(() => {
        if (keypairs.length > 0) {
            fetchBalance();
        }
    }, [keypairs]);

    const handleSendTransaction = async () => {
        if (!selectedKeypair || !recipient || !sendAmount) {
            console.error("Invalid transaction details");
            return;
        }

        try {
            // Manually construct the transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: selectedKeypair.publicKey,
                    toPubkey: new PublicKey(recipient),
                    lamports: parseFloat(sendAmount) * 1e9, // Convert SOL to lamports
                })
            );

            const recentBlockhash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = recentBlockhash.blockhash;
            transaction.feePayer = selectedKeypair.publicKey;

            // Serialize the transaction
            const transactionBuffer = transaction.serializeMessage();
            const signature = nacl.sign.detached(transactionBuffer, selectedKeypair.secretKey);

            // Manually add the signature
            transaction.addSignature(selectedKeypair.publicKey, signature);

            // Verify the signature
            const isVerifiedSignature = transaction.verifySignatures();
            console.log(`The signatures were verified: ${isVerifiedSignature}`);

            // Serialize and send the raw transaction
            const rawTransaction = transaction.serialize();
            const txid = await connection.sendRawTransaction(rawTransaction);
            await connection.confirmTransaction(txid, 'confirmed');

            console.log("Transaction successful with signature:", txid);
            fetchBalance(); // Update balances after the transaction
            handleClose(); // Close the modal after sending
            handleShowSuccess()
        } catch (error) {
            console.error("Transaction failed:", error);
        }
    };

    return (
        <>
            <div className="">
                <div className="text-center mb-4">
                    <Button className="btn sitebtn" onClick={createWallet}>Add Wallet</Button>
                </div>
                <SimpleBar style={{ maxHeight: 250 }}>
                    <Table responsive striped bordered hover>
                        <thead>
                            <tr>
                                <th>Wallet Address</th>
                                <th>Balance</th>
                                <th>Send</th>
                                <th>Receive</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keypairs.map((kp, index) => (
                                <tr key={index}>
                                    <td>{kp.publicKey.toBase58()}</td>
                                    <td>{balances[index] ? (balances[index] / 1e9).toFixed(4) : "No"} SOL</td>
                                    <td><Button onClick={() => handleShow(kp)} className="btn sitebtn">Send</Button></td>
                                    <td><Button onClick={() => handleShowRecieve(kp.publicKey.toBase58())} className="btn sitebtn">Receive</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </SimpleBar>
            </div>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Send SOL</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Solana Address</Form.Label>
                            <Form.Control
                                placeholder="Enter address to send"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount (SOL)</Form.Label>
                            <Form.Control
                                placeholder="Enter amount to send"
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                            />
                        </Form.Group>
                        <div className="text-center">
                            <Button className="btn sitebtn" onClick={handleSendTransaction}>Confirm</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal
                show={showSuccess}
                onHide={handleCloseSuccess}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="successimgbg">
                        <Image src={success} alt="success" className="successimg"/>
                    </div>
                    <div className="text-center mt-3">
                        <h2 className="successtrx">Your transaction has been successfully completed!</h2>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal
                show={showKey}
                onHide={handleCloseKey}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="keyimgbg">
                        <Image src={solimg} alt="publickey" className="keyimg"/>
                    </div>
                    <div className="text-center mt-3">
                        <h2 className="successtrx">Send SOL to this address : <span className="soladdr">{receieveAddress}</span></h2>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SolanaWallet;

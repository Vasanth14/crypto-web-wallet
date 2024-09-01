import { useEffect, useState } from "react"
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const SolanaWallet = ({ mnemonic }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [publicKeys, setPublicKeys] = useState([]);
    const [balance, setBalances] = useState([]);
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    useEffect(() => {
        const storedPublicKeys = localStorage.getItem('publicKeys');
        if (storedPublicKeys) {
            const publicKeyStrings = JSON.parse(storedPublicKeys);
            const publicKeys = publicKeyStrings.map((key) => new PublicKey(key));
            setPublicKeys(publicKeys);
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
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
            const keypair = Keypair.fromSecretKey(secret);
            setCurrentIndex(currentIndex + 1);
            setPublicKeys([...publicKeys, keypair.publicKey]);
            localStorage.setItem('publicKeys', JSON.stringify([...publicKeys, keypair.publicKey]));
        } catch (error) {
            console.error("Failed to create wallet:", error);
        }
    };

    const fetchBalance = async () => {
        const newBalances = await Promise.all(
            publicKeys.map(async (pubKey) => {
                try {
                    const balance = await connection.getBalance(new PublicKey(pubKey));
                    return balance;
                } catch (error) {
                    console.error("Error fetching balance for:", pubKey.toBase58(), error);
                    return 0; // Return 0 if there's an error
                }
            })
        );
        setBalances(newBalances);
    };

    useEffect(() => {
        if (publicKeys.length > 0) {
            fetchBalance();
        }
    }, [publicKeys]);

    return (
        <>
            <SimpleBar style={{ maxHeight: 500 }}>
                <div className="">
                    <div className="text-center mb-4">
                        <Button className="btn sitebtn" onClick={createWallet}>Add Wallet</Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Wallet Address</th>
                                <th>Balance</th>
                                <th>Send</th>
                                <th>Receieve</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publicKeys.map((p, index) => (
                                <tr key={index}>
                                    <td>{p.toBase58()}</td>
                                    <td>{balance[index] ? (balance[index] / 1e9).toFixed(4) : "No"} SOL</td>
                                    <td><Button className="btn sitebtn">Send</Button></td>
                                    <td><Button className="btn sitebtn">Receive</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </SimpleBar>
        </>
    );
}

export default SolanaWallet;
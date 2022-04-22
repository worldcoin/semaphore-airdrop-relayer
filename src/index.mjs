import { json, send } from "micro";
import { Relayer } from "defender-relay-client";
import { Contract, getDefaultProvider } from "ethers";
// import SemaphoreAirdrop from "./abi/SemaphoreAirdrop.json" assert { type: "json" };

// quick hack
const SemaphoreAirdrop = '[{"inputs": [{"internalType": "contract ISemaphore","name": "_semaphore","type": "address"},{"internalType": "uint256","name": "_groupId","type": "uint256"},{"internalType": "contract ERC20","name": "_token","type": "address"},{"internalType": "address","name": "_holder","type": "address"},{"internalType": "uint256","name": "_airdropAmount","type": "uint256"}],"stateMutability": "nonpayable","type": "constructor"},{"inputs": [],"name": "InvalidNullifier","type": "error"},{"inputs": [],"name": "InvalidProof","type": "error"},{"inputs": [],"name": "Unauthorized","type": "error"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "receiver","type": "address"}],"name": "AirdropClaimed","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"}],"name": "AmountUpdated","type": "event"},{"inputs": [],"name": "airdropAmount","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "receiver","type": "address"},{"internalType": "uint256","name": "root","type": "uint256"},{"internalType": "uint256","name": "nullifierHash","type": "uint256"},{"internalType": "uint256[8]","name": "proof","type": "uint256[8]"}],"name": "claim","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "holder","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "manager","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "token","outputs": [{"internalType": "contract ERC20","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "updateAmount","outputs": [],"stateMutability": "nonpayable","type": "function"}]';

const relayer = new Relayer({
	apiKey: process.env.OZ_KEY,
	apiSecret: process.env.OZ_SECRET,
});
const contract = new Contract(
	process.env.CONTRACT_ADDRESS,
	SemaphoreAirdrop,
	getDefaultProvider(process.env.NETWORK)
);

export default async (req, res) => {
	const { receiver, root, nullifierHash, proof } = await json(req);
	if (!receiver || !root || !nullifierHash || !proof) {
		return send(res, 400, "Invalid Request");
	}

	const [call, gasLimit] = await Promise.all([
		contract.populateTransaction.claim(receiver, root, nullifierHash, proof),
		contract.estimateGas.claim(receiver, root, nullifierHash, proof),
	]);

	const tx = await relayer.sendTransaction({
		gasLimit,
		to: call.to,
		data: call.data,
	});

	return tx.hash;
};

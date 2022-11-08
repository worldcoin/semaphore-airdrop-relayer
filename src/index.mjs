import { json, send } from "micro";
import { Relayer } from "defender-relay-client";
import { Contract, getDefaultProvider } from "ethers";

// quick hack
const SemaphoreAirdrop =
	'[{"inputs": [{"internalType": "contract ISemaphore","name": "_semaphore","type": "address"},{"internalType": "uint256","name": "_groupId","type": "uint256"},{"internalType": "contract ERC20","name": "_token","type": "address"},{"internalType": "address","name": "_holder","type": "address"},{"internalType": "uint256","name": "_airdropAmount","type": "uint256"}],"stateMutability": "nonpayable","type": "constructor"},{"inputs": [],"name": "InvalidNullifier","type": "error"},{"inputs": [],"name": "InvalidProof","type": "error"},{"inputs": [],"name": "Unauthorized","type": "error"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "receiver","type": "address"}],"name": "AirdropClaimed","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"}],"name": "AmountUpdated","type": "event"},{"inputs": [],"name": "airdropAmount","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "receiver","type": "address"},{"internalType": "uint256","name": "root","type": "uint256"},{"internalType": "uint256","name": "nullifierHash","type": "uint256"},{"internalType": "uint256[8]","name": "proof","type": "uint256[8]"}],"name": "claim","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "holder","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "manager","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "token","outputs": [{"internalType": "contract ERC20","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "updateAmount","outputs": [],"stateMutability": "nonpayable","type": "function"}]';
const SemaphoreMultiAirdrop =
	'[{"inputs":[{"internalType":"contract ISemaphore","name":"_semaphore","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidAirdrop","type":"error"},{"inputs":[],"name":"InvalidNullifier","type":"error"},{"inputs":[],"name":"Unauthorized","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"airdropId","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"}],"name":"AirdropClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"airdropId","type":"uint256"},{"components":[{"internalType":"uint256","name":"groupId","type":"uint256"},{"internalType":"contract ERC20","name":"token","type":"address"},{"internalType":"address","name":"manager","type":"address"},{"internalType":"address","name":"holder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"indexed":false,"internalType":"struct SemaphoreMultiAirdrop.Airdrop","name":"airdrop","type":"tuple"}],"name":"AirdropCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"airdropId","type":"uint256"},{"components":[{"internalType":"uint256","name":"groupId","type":"uint256"},{"internalType":"contract ERC20","name":"token","type":"address"},{"internalType":"address","name":"manager","type":"address"},{"internalType":"address","name":"holder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"indexed":false,"internalType":"struct SemaphoreMultiAirdrop.Airdrop","name":"airdrop","type":"tuple"}],"name":"AirdropUpdated","type":"event"},{"inputs":[{"internalType":"uint256","name":"airdropId","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"root","type":"uint256"},{"internalType":"uint256","name":"nullifierHash","type":"uint256"},{"internalType":"uint256[8]","name":"proof","type":"uint256[8]"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"groupId","type":"uint256"},{"internalType":"contract ERC20","name":"token","type":"address"},{"internalType":"address","name":"holder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"createAirdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"getAirdrop","outputs":[{"internalType":"uint256","name":"groupId","type":"uint256"},{"internalType":"contract ERC20","name":"token","type":"address"},{"internalType":"address","name":"manager","type":"address"},{"internalType":"address","name":"holder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"airdropId","type":"uint256"},{"components":[{"internalType":"uint256","name":"groupId","type":"uint256"},{"internalType":"contract ERC20","name":"token","type":"address"},{"internalType":"address","name":"manager","type":"address"},{"internalType":"address","name":"holder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct SemaphoreMultiAirdrop.Airdrop","name":"airdrop","type":"tuple"}],"name":"updateDetails","outputs":[],"stateMutability":"nonpayable","type":"function"}]';

const relayer = new Relayer({
	apiKey: process.env.OZ_KEY,
	apiSecret: process.env.OZ_SECRET,
});
const contract = new Contract(
	process.env.CONTRACT_ADDRESS,
	process.env.USE_MULTI ? SemaphoreMultiAirdrop : SemaphoreAirdrop,
	getDefaultProvider(process.env.NETWORK)
);

export default async (req, res) => {
	const { airdropId, receiver, root, nullifierHash, proof } = await json(req);
	if (
		!receiver ||
		!root ||
		!nullifierHash ||
		!proof ||
		(!airdropId && process.env.USE_MULTI)
	) {
		return send(res, 400, "Invalid Request");
	}

	const [call, gasLimit] = await Promise.all([
		process.env.USE_MULTI
			? contract.populateTransaction.claim(
					airdropId,
					receiver,
					root,
					nullifierHash,
					proof
			  )
			: contract.populateTransaction.claim(
					receiver,
					root,
					nullifierHash,
					proof
			  ),
		1_000_000,
		// contract.estimateGas.claim(receiver, root, nullifierHash, proof),
	]);

	const tx = await relayer.sendTransaction({
		gasLimit,
		to: call.to,
		data: call.data,
	});

	return {
		id: tx.transactionId,
		hash: tx.hash,
	}
};

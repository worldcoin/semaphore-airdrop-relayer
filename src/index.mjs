import { json, send } from "micro";
import { Relayer } from "defender-relay-client";
import { Contract, getDefaultProvider } from "ethers";
import SemaphoreAirdrop from "./abi/SemaphoreAirdrop.json" assert { type: "json" };

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

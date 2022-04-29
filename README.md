# semaphore-airdrop-relayer

> A server that relays proofs to [Semaphore Airdrop](https://github.com/worldcoin/semaphore-airdrop) contracts.

## Setup

To get started, you will need to create an [OpenZeppelin Relayer](https://defender.openzeppelin.com/#/relay) for the network that you want to work with, and seed it with some ETH. You'll also need a deployed version of the [Semaphore Airdrop contract](https://github.com/worldcoin/semaphore-airdrop).

While you can set up the environment yourself, we provide a [Docker image](https://github.com/worldcoin/semaphore-airdrop-relayer/pkgs/container/semaphore-airdrop-relayer) for convenience. You'll just need to configure the following env variables:

- `OZ_KEY` OpenZeppelin Defender Relayer Key
- `OZ_SECRET` OpenZeppelin Defender Relayer Secret
- `CONTRACT_ADDRESS` Address of the airdrop contract to use
- `NETWORK` The network to use
- `USE_MULTI` Whether to use the multi-airdrop contract instead of the single airdrop one

## Usage

The image exposes a web server on port `3000`, which will relay transactions for POST requests with the following format:

```typescript
interface RelayerRequest {
	receiver: string;
	root: bignumber;
	nullifierHash: bignumber;
	proof: bignumber[8];
}
```

## License

This project is open-sourced software licensed under the MIT license. See the [License file](LICENSE) for more information.

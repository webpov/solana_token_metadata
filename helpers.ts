// tokenHelpers.js
import * as web3 from "@solana/web3.js";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { none, percentAmount, publicKey } from "@metaplex-foundation/umi";
import * as bs58 from "bs58";

export const SPL_TOKEN_2022_PROGRAM_ID = publicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const umiRpcEndpoint = process.env.UMI_RPC_ENDPOINT || ''; // https://api.mainnet-beta.solana.com
export const ourMetadata = {
  "name": process.env.METADATA_NAME || 'Test Coin Name',
  "symbol": process.env.METADATA_SYMBOL || 'BTC',
  "uri": process.env.METADATA_URI || '"https://mileisol.com/token22/milei_metadata.json"',
};

export function loadWalletKey(keypairFile: string): web3.Keypair {
  const fs = require("fs");
  return web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
  );
}

export function getMintPublicKey(tokenAddress: string): web3.PublicKey {
  return new web3.PublicKey(tokenAddress);
}

export async function createOrUpdateToken(isCreate, umi, mint, metadata, actionFunction) {
  const onChainData = {
    ...metadata,
    sellerFeeBasisPoints: percentAmount(0, 2),
    creators: none(),
    collection: none(),
    uses: none(),
  };

  const accounts = {
    mint: fromWeb3JsPublicKey(mint),
    ...(isCreate && { splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID }),
  };

  const data = {
    ...(isCreate ? onChainData : {}),
    ...(isCreate ? { isMutable: true } : {}),
    discriminator: 0,
    ...(isCreate ? { tokenStandard: null, createV1Discriminator: 0, primarySaleHappened: true } : { data: none(), updateV1Discriminator: 0 }),
  };

  const txid = await actionFunction(umi, { ...accounts, ...data }).sendAndConfirm(umi);
  console.log(bs58.encode(txid.signature));
}

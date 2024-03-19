// tokenHelpers.js
import 'dotenv/config'


import { createV1, updateV1 ,Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda, CreateV1InstructionAccounts, CreateV1InstructionData, TokenStandard, CollectionDetails, PrintSupply, UpdateV1InstructionData, UpdateV1InstructionAccounts, Data} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, percentAmount, publicKey, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
import * as bs58 from "bs58";
import 'dotenv/config'
import { TransactionExpiredBlockheightExceededError } from '@solana/web3.js';

export const SPL_TOKEN_2022_PROGRAM_ID = publicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const umiRpcEndpoint = process.env.UMI_RPC_ENDPOINT || ''; // https://api.mainnet-beta.solana.com
export const ourMetadata = {
  "name": process.env.METADATA_NAME || 'Test Coin Name',
  "symbol": process.env.METADATA_SYMBOL || 'BTC',
  "uri": process.env.METADATA_URI || 'https://mileisol.com/token22/milei_metadata.json',
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

// Utility function to sleep for a given number of milliseconds
function sleep(ms:any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createOrUpdateToken(mint:any, umi:any, maxRetries = 3, retryDelay = 5000) {
  const onChainData = {
    ...ourMetadata,
    sellerFeeBasisPoints: percentAmount(0, 2),
    creators: none<Creator[]>(),
    collection: none<Collection>(),
    uses: none<Uses>(),
  };

  const accounts = {
    mint: fromWeb3JsPublicKey(mint),
    splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
  };

  const data = {
    ...onChainData,
    isMutable: true,
    discriminator: 0,
    tokenStandard: TokenStandard.Fungible,
    collectionDetails: none<CollectionDetails>(),
    ruleSet: none<PublicKey>(),
    createV1Discriminator: 0,
    primarySaleHappened: true,
    decimals: none<number>(),
    printSupply: none<PrintSupply>(),
  };
  console.log("createOrUpdateTokencreateOrUpdateToken")

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log("Attempt to create or update the token and confirm the transaction")
      // Attempt to create or update the token and confirm the transaction
      const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);

      // If the transaction is successful, return the transaction ID
      console.log("If the transaction is successful, return the transaction ID")
      return txid;
    } catch (error) {
      // Check if the error is due to transaction expiration
      console.log("Check if the error is due to transaction expiration")
      if (error instanceof TransactionExpiredBlockheightExceededError) {
        console.warn(`Attempt ${attempt} failed: Transaction expired. Retrying after ${retryDelay}ms...`);

        // Wait for a specified delay before retrying
        console.log("Wait for a specified delay before retrying")
        await sleep(retryDelay);
      } else {
        // If the error is not due to transaction expiration, rethrow it
        console.log("If the error is not due to transaction expiration, rethrow it")
        throw error;
      }
    }
  }

  // If all attempts fail, throw an error
  console.log("If all attempts fail, throw an error")
  throw new Error('Failed to create or update token after maximum retries.');
}


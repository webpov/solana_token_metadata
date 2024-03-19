// initializeToken.js
import { loadWalletKey, getMintPublicKey, umiRpcEndpoint, ourMetadata, SPL_TOKEN_2022_PROGRAM_ID, createOrUpdateToken } from './helpers';
import { createV1, updateV1 ,Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda, CreateV1InstructionAccounts, CreateV1InstructionData, TokenStandard, CollectionDetails, PrintSupply, UpdateV1InstructionData, UpdateV1InstructionAccounts, Data} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, createSignerFromKeypair, none, percentAmount, publicKey, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
import * as web3 from "@solana/web3.js";
import * as bs58 from "bs58";
import 'dotenv/config'
import { TransactionExpiredBlockheightExceededError } from '@solana/web3.js';

// Utility function to sleep for a given number of milliseconds
function sleep(ms:any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initializeToken() {
  // console.log("process.env.KEYPAIR_FILE", process.env.KEYPAIR_FILE)
  const myKeypair:any = loadWalletKey(process.env.KEYPAIR_FILE || '');
  // console.log("process.env.TOKEN_ADDRESS", process.env.TOKEN_ADDRESS)
  const mint = new web3.PublicKey(process.env.TOKEN_ADDRESS || '');
  // console.log("process.env.UMI_RPC_ENDPOINT", process.env.UMI_RPC_ENDPOINT)
  const umi = createUmi(process.env.UMI_RPC_ENDPOINT || '');

  const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
  umi.use(signerIdentity(signer, true));
  
  console.log("onChainDataonChainData")
  const onChainData = {
    ...ourMetadata,
    // we don't need that
    sellerFeeBasisPoints: percentAmount(0,2),
    creators: none<Creator[]>(),
    collection: none<Collection>(),
    uses: none<Uses>(),
  }
  const accounts: CreateV1InstructionAccounts = {
      mint: fromWeb3JsPublicKey(mint),
      splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
  }
  const data: CreateV1InstructionData = {
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
  }
  // console.log("umi, {...accounts, ...data",  accounts, data)
  // const txid:any = createOrUpdateToken(mint, umi)
  const retryDelay = 5000
  const maxRetries = 3
  console.log("createV1createV1createV1")
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
    
    const txid = await createV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
    console.log(bs58.encode(txid.signature))
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
}

console.log("Initializing token...");
initializeToken();

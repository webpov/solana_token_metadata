// initializeToken.js
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createV1 } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { loadWalletKey, getMintPublicKey, umiRpcEndpoint, ourMetadata, createOrUpdateToken } from './helpers';

async function initializeToken() {
  const myKeypair:any = loadWalletKey(process.env.KEYPAIR_FILE || '');
  const mint = getMintPublicKey(process.env.TOKEN_ADDRESS || '');
  const umi = createUmi(umiRpcEndpoint);

  const signer = createSignerFromKeypair(umi, myKeypair);
  umi.use(signerIdentity(signer, true));

  await createOrUpdateToken(true, umi, mint, ourMetadata, createV1);
}

console.log("Initializing token...");
initializeToken();

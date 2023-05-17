interface ImportMetaEnv {
  readonly PUBLIC_SOROBAN_ABUNDANCE_TOKEN_CONTRACT_ID: string;
  readonly SOROBAN_ABUNDANCE_TOKEN_CONTRACT_ID: string;

  readonly PUBLIC_SOROBAN_NETWORK_NAME: string;
  readonly SOROBAN_NETWORK_NAME: string;

  readonly PUBLIC_SOROBAN_NETWORK_PASSPHRASE: string;
  readonly SOROBAN_NETWORK_PASSPHRASE: string;

  readonly PUBLIC_SOROBAN_RPC_URL: string;
  readonly SOROBAN_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
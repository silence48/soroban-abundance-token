import {
  isConnected,
  getPublicKey,
  signTransaction,
} from "@stellar/freighter-api";
import * as SorobanClient from 'soroban-client'
import { Buffer } from "buffer";
import type { Account, Memo, MemoType, Operation, Transaction } from 'soroban-client';
import { NETWORK_NAME, NETWORK_PASSPHRASE, CONTRACT_ID } from './constants'
import { server } from './server'
window.Buffer = window.Buffer || Buffer;

type Tx = Transaction<Memo<MemoType>, Operation[]>

type Simulation = NonNullable<SorobanClient.SorobanRpc.SimulateTransactionResponse['results']>[0]

type TxResponse = Awaited<ReturnType<typeof server.sendTransaction>>

type InvokeArgs = {
  method: string
  args?: any[]
  sign?: boolean
}

/**
 * Get account details from the Soroban network for the publicKey currently
 * selected in Freighter. If not connected to Freighter, throws errors. Will
 * pop up Freighter's modal to request user permissions, if this hasn't been
 * done already.
 */
export async function getAccount(): Promise<Account> {
  if (!await isConnected()) {
    throw new Error('Freighter not connected')
  }
  const publicKey = await getPublicKey()
  if (!publicKey) {
    throw new Error('Freighter not initialized')
  }
  return await server.getAccount(publicKey)
}

/**
 * Invoke a method on the Abundance token contract.
 *
 * @param {string} obj.method - The method to invoke.
 * @param {any[]} obj.args - The arguments to pass to the method.
 * @param {boolean} obj.sign - Whether to sign the transaction with Freighter.
 * @returns The transaction response, or the simulation result if `sign` is false.
 */
export async function invoke(args: InvokeArgs & { sign: false }): Promise<Simulation>;
export async function invoke(args: InvokeArgs & { sign: true }): Promise<TxResponse>;
export async function invoke(args: InvokeArgs & { sign?: undefined }): Promise<TxResponse>;
export async function invoke({ method, args = [], sign = true }: InvokeArgs): Promise<TxResponse | Simulation> {
  const account = await getAccount()

  const contract = new SorobanClient.Contract(CONTRACT_ID)

  let tx = new SorobanClient.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build()

  if (sign) {
    // Simulate the tx to discover the storage footprint, and update the
    // tx to include it. If you already know the storage footprint you
    // can use `addFootprint` to add it yourself, skipping this step.
    tx = await server.prepareTransaction(tx, NETWORK_PASSPHRASE) as Tx

    // sign with Freighter
    const signed = await signTransaction(tx.toXDR(), {
      network: NETWORK_NAME,
      networkPassphrase: NETWORK_PASSPHRASE,
    })

    // re-assemble with signed tx
    tx = SorobanClient.TransactionBuilder.fromXDR(
      signed,
      NETWORK_PASSPHRASE
    ) as Tx

    return await server.sendTransaction(tx);
  }

  const { results } = await server.simulateTransaction(tx)
  if (!results || results[0] === undefined) {
    throw new Error("Invalid response from simulateTransaction")
  }
  return results[0]
}

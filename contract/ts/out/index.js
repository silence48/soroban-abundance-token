import * as SorobanClient from 'soroban-client';
import { Buffer } from "buffer";
import { scvalToBigInt } from './convert';
import { invoke } from './invoke';
export * from './server';
export * from './invoke';
window.Buffer = window.Buffer || Buffer;
/**
 * Get the symbol for the Abundance token.
 * Caches the value in-memory so it only fetches once per page load, since it's unlikely to change.
 * @returns The symbol for the Abundance token.
 */
export async function symbol() {
    const { xdr } = await invoke({ method: 'symbol', sign: false });
    const scVal = SorobanClient.xdr.ScVal.fromXDR(xdr, 'base64');
    ///@ts-expect-error
    return scVal.value()?.toString() ?? '';
}
export async function balance({ id }) {
    if (!id) {
        throw new Error('You need to specify an account `id` for which to get a balance:\n\n' +
            '  getBalance({ id: "G..." })`');
    }
    const { xdr } = await invoke({
        method: 'balance',
        args: [SorobanClient.Address.fromString(id).toScVal()],
        sign: false,
    });
    const scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));
    return scvalToBigInt(scVal);
}
export async function decimals() {
    const { xdr } = await invoke({
        method: 'decimals',
        sign: false,
    });
    const scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));
    return Number(scvalToBigInt(scVal));
}
export async function tokenPlz({ id = "" }) {
    if (!id) {
        throw new Error('You need to specify an account `id` for which to mint a token:\n\n' +
            '  tokenPlz({ id: "G..." })`');
    }
    await invoke({
        method: 'token_plz',
        args: [SorobanClient.Address.fromString(id).toScVal()],
    });
}

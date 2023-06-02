import {CidrBlock, cidrBlockFromString, createCidrBlock} from "./cidr-block";
import {Ipv6Address, ipv6AddressFromBigInt, ipv6AddressFromString} from "./ipv6-address";

/** An IPv6 CIDR Block that has been sliced into smaller blocks. */
export interface Ipv6CidrBlockSlices {
    /** Returns the i'th slice. */
    readonly get: (i: bigint) => CidrBlock<Ipv6Address, Ipv6CidrBlockSlices>,
    /** The number of slices. */
    readonly length: bigint,
}

const maxPrefixLength = 64;
const maxBitsLength = 128;

/** Parses an IPv6 CIDR Block from its canonical string format, e.g., "2001:db8:1337::/48". */
export function ipv6CidrBlockFromString(block: string): CidrBlock<Ipv6Address, Ipv6CidrBlockSlices> {
    return cidrBlockFromString(block, maxPrefixLength, ipv6AddressFromString, createSlices);
}

function createSlices(
    block: CidrBlock<Ipv6Address, Ipv6CidrBlockSlices>,
    slicePrefixLength: number): Ipv6CidrBlockSlices {
    if (slicePrefixLength < block.prefixLength) {
        throw new Error(
            `slicePrefixLength (${slicePrefixLength}) cannot be less than block.prefixLength (${block.prefixLength})`);
    }
    if (slicePrefixLength > maxPrefixLength) {
        throw new Error(
            `slicePrefixLength (${slicePrefixLength}) exceeds max prefix length (${maxPrefixLength})`);
    }
    const sliceBits = slicePrefixLength - block.prefixLength;
    const slicesLength = 1n << BigInt(sliceBits);

    return {
        length: slicesLength,
        get(i) {
            if (i < 0 || i >= this.length) {
                throw new Error(`Out-of-bounds: check failed: 0 <= ${i} < ${this.length} slices`);
            }
            const suffixAddrVal = i << BigInt(maxBitsLength - slicePrefixLength);
            const sliceAddrVal = block.address.bigIntValue | suffixAddrVal;
            return createCidrBlock(
                ipv6AddressFromBigInt(sliceAddrVal),
                slicePrefixLength,
                maxPrefixLength,
                createSlices,
            );
        },
    };
}

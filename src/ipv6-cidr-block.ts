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

/** Parses an IPv6 CIDR Block from its canonical string format, e.g., "2001:db8:1337::/48". */
export function ipv6CidrBlockFromString(block: string): CidrBlock<Ipv6Address, Ipv6CidrBlockSlices> {
    return cidrBlockFromString(block, maxPrefixLength, ipv6AddressFromString, createSlices);
}

function createSlices(block: CidrBlock<Ipv6Address, Ipv6CidrBlockSlices>, slicePrefixLength: number): Ipv6CidrBlockSlices {
    if (slicePrefixLength < block.prefixLength) {
        throw new Error(
              `slicePrefixLength (${slicePrefixLength}) cannot be less than block.prefixLength (${block.prefixLength})`);
    }
    const sliceBits = slicePrefixLength - block.prefixLength;
    const slicesLength = 1n << BigInt(sliceBits);

    return {
        length: slicesLength,
        get: i => {
            if (i < 0 || i >= slicesLength) {
                throw new Error(`Out-of-bounds: check failed: 0 <= ${i} < ${slicesLength} slices`);
            }
            const sliceAddrVal = block.address.bigIntValue | (i << BigInt(128 - slicePrefixLength));
            return createCidrBlock(
                ipv6AddressFromBigInt(sliceAddrVal),
                slicePrefixLength,
                maxPrefixLength,
                createSlices,
            );
        },
    };
}

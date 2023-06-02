import {CidrBlock, cidrBlockFromString, createCidrBlock} from "./cidr-block";
import {Ipv4Address, ipv4AddressFromInt, ipv4AddressFromString} from "./ipv4-address";

/** An IPv4 CIDR Block that has been sliced into smaller blocks. */
export interface Ipv4CidrBlockSlices {
    /** Returns the i'th slice. */
    readonly get: (i: number) => CidrBlock<Ipv4Address, Ipv4CidrBlockSlices>,
    /** The number of slices. */
    readonly length: number,
}

const maxPrefixLength = 32;
const maxBitsLength = 32;

/** Parses an IPv4 CIDR Block from its canonical string format, e.g., "192.0.2.0/24". */
export function ipv4CidrBlockFromString(block: string): CidrBlock<Ipv4Address, Ipv4CidrBlockSlices> {
    return cidrBlockFromString(block, maxPrefixLength, ipv4AddressFromString, createSlices);
}

function createSlices(
    block: CidrBlock<Ipv4Address, Ipv4CidrBlockSlices>,
    slicePrefixLength: number): Ipv4CidrBlockSlices {
    if (!Number.isInteger(slicePrefixLength) || slicePrefixLength < block.prefixLength) {
        throw new Error(
            `slicePrefixLength (${slicePrefixLength}) cannot be less than block.prefixLength (${block.prefixLength})`);
    }
    if (slicePrefixLength > maxPrefixLength) {
        throw new Error(
            `slicePrefixLength (${slicePrefixLength}) exceeds max prefix length (${maxPrefixLength})`);
    }
    const sliceBits = slicePrefixLength - block.prefixLength;
    const slicesLength = 2 ** sliceBits;

    return {
        length: slicesLength,
        get(i) {
            if (i < 0 || i >= this.length) {
                throw new Error(`Out-of-bounds: check failed: 0 <= ${i} < ${this.length} slices`);
            }
            const suffixAddrVal = i << (maxBitsLength - slicePrefixLength);
            const sliceAddrVal = block.address.uintValue | suffixAddrVal;

            return createCidrBlock(
                ipv4AddressFromInt(sliceAddrVal),
                slicePrefixLength,
                maxPrefixLength,
                createSlices,
            );
        },
    };
}

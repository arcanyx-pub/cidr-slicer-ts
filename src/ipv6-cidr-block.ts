import {Ipv6Address, ipv6AddressFromBigInt, ipv6AddressFromString} from "./ipv6-address";

/** IPv6 CIDR Block. */
export interface Ipv6CidrBlock {
    /** The normalized address, with all bits right of the prefix set to 0. */
    readonly addr: Ipv6Address,
    /** The prefix length specified by the notation, e.g., 60 for "2001:db8::/60". */
    readonly prefixLength: number,
    /**
     * Slice (i.e. partition) the block into smaller sub-blocks of the given slicePrefixLength.
     *
     * slicePrefixLength must be <= block.prefixLength.
     */
    readonly slice: (slicePrefixLength: number) => Ipv6CidrBlockSlices,
    /** Returns the canonical string representation of the CIDR block (with proper elision) */
    readonly toCanonicalString: () => string,
}

/** An IPv6 CIDR Block that has been sliced into smaller blocks. */
export interface Ipv6CidrBlockSlices {
    /** Returns the i'th slice. */
    readonly get: (i: bigint) => Ipv6CidrBlock,
    /** The number of slices. */
    readonly length: bigint,
}

/** Parses an IPv6 CIDR Block from its canonical string format, e.g., "2001:db8:1337::/48". */
export function ipv6CidrBlockFromString(block: string): Ipv6CidrBlock {
    if (block.length === 0) {
        throw new Error("Cannot parse empty block");
    }
    const [addrStr, prefixLengthStr, tooManySlashes] = block.split("/", 3);

    if (tooManySlashes !== undefined) {
        throw new Error(`Cannot parse malformed ${block}, only expected one "/"`);
    }
    if (prefixLengthStr === undefined) {
        throw new Error(
              `Cannot parse malformed ${block}, a prefix length (e.g., /56) is required.`);
    }
    const prefixLength = Number(prefixLengthStr);
    if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 64) {
        throw new Error(`Cannot parse malformed ${block}, prefix length L must be 0 <= L <= 64.`);
    }

    if (addrStr.length === 0) {
        throw new Error(`Cannot parse malformed ${block}, an address before "/" is required.`);
    }
    const addr = ipv6AddressFromString(addrStr);

    return createCidrBlockV6(addr, prefixLength);
}

function createCidrBlockV6(addr: Ipv6Address, prefixLength: number): Ipv6CidrBlock {
    return {
        addr,
        prefixLength,
        slice(slicePrefixLength: number) {
            return createSlices(this, slicePrefixLength);
        },
        toCanonicalString() {
            return `${this.addr.toCanonicalString()}/${this.prefixLength}`;
        },
    };
}

function createSlices(block: Ipv6CidrBlock, slicePrefixLength: number): Ipv6CidrBlockSlices {
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
            const sliceAddrVal = block.addr.bigIntValue + (i << BigInt(128 - slicePrefixLength));
            return createCidrBlockV6(ipv6AddressFromBigInt(sliceAddrVal), slicePrefixLength);
        },
    };
}

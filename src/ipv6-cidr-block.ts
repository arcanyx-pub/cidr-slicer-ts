import {ipv6AddressFromBigInt, Ipv6Address, ipv6AddressFromString} from "./ipv6-address";

/** IPv6 CIDR Block. */
export interface Ipv6CidrBlock {
    /** The normalized address, with all bits right of the prefix set to 0. */
    readonly addr: Ipv6Address,
    /** The prefix length specified by the notation, e.g., 60 for "2001:db8::/60". */
    readonly prefixLength: number,
    /**
     * Slice (i.e. partition) the block into smaller sub-blocks of the given slicePrefixLength.
     * Return the sub-block with the given sliceIndex in the resulting sub-block array.
     */
    readonly slice: (slicePrefixLength: number, sliceIndex: number) => Ipv6CidrBlock,
    /** Returns the canonical string representation of the CIDR block (with proper elision) */
    readonly toCanonicalString: () => string,
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
        throw new Error(`Cannot parse malformed ${block}, prefix length must be <= 64.`);
    }

    if (addrStr.length === 0) {
        throw new Error(`Cannot parse malformed ${block}, an address before "/" is required.`);
    }
    const addr = ipv6AddressFromString(addrStr);

    return createCidrBlockV6(addr, prefixLength);
}

function createCidrBlockV6(addr: Ipv6Address, prefixLength: number) {
    return {
        addr,
        prefixLength,
        slice: (slicePrefixLength: number, sliceIndex: number) => {
            if (slicePrefixLength < prefixLength) {
                throw new Error(
                      `slicePrefixLength (${slicePrefixLength}) cannot be less than prefixLength (${prefixLength})`);
            }
            const sliceBits = slicePrefixLength - prefixLength;
            const maxSlices = 1 << sliceBits;
            if (sliceIndex >= maxSlices) {
                throw new Error(`Requested slice#${sliceIndex} but only ${maxSlices} are available.`);
            }
            return createCidrBlockV6(
                  ipv6AddressFromBigInt(addr.bigIntValue + (BigInt(sliceIndex) << BigInt(128 - slicePrefixLength))),
                  slicePrefixLength,
            );
        },
        toCanonicalString: () => `${addr.toCanonicalString()}/${prefixLength}`,
    };
}

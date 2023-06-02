interface IpAddress {
    readonly toString: () => string,
    readonly mask: (prefixLength: number) => this,
}

export interface CidrBlock<IP, SLICES> {
    /** The normalized address, with all bits right of the prefix set to 0. */
    readonly address: IP,
    /** The prefix length specified by the notation, e.g., 60 for "2001:db8::/60". */
    readonly prefixLength: number,
    /**
     * Slice (i.e. partition) the block into smaller sub-blocks of the given slicePrefixLength.
     *
     * slicePrefixLength must be <= block.prefixLength.
     */
    readonly slice: (slicePrefixLength: number) => SLICES,
    /** Returns the canonical string representation of the CIDR block (with proper elision) */
    readonly toString: () => string,
}

export function cidrBlockFromString<IP extends IpAddress, SLICES>(
    block: string,
    maxPrefixLength: number,
    ipAddressFromString: (addrStr: string) => IP,
    slice: (block: CidrBlock<IP, SLICES>, slicePrefixLength: number) => SLICES,
): CidrBlock<IP, SLICES> {
    if (block.length === 0) {
        throw new Error("Cannot parse empty block");
    }
    const [addrStr, prefixLengthStr, tooManySlashes] = block.split("/", 3);

    if (tooManySlashes !== undefined) {
        throw new Error(`Cannot parse malformed ${block}, only expected one "/"`);
    }
    if (prefixLengthStr === undefined || prefixLengthStr.length === 0) {
        const examplePrefixLength = Math.floor(maxPrefixLength / 2);
        throw new Error(
            `Cannot parse malformed ${block}, prefix length (e.g., /${examplePrefixLength}) was missing.`);
    }
    const prefixLength = Number(prefixLengthStr);

    if (addrStr.length === 0) {
        throw new Error(`Cannot parse malformed ${block}, an address before "/" is required.`);
    }
    const addr = ipAddressFromString(addrStr);

    return createCidrBlock(addr, prefixLength, maxPrefixLength, slice);
}

export function createCidrBlock<IP extends IpAddress, SLICES>(
    address: IP,
    prefixLength: number,
    maxPrefixLength: number,
    slice: (block: CidrBlock<IP, SLICES>, slicePrefixLength: number) => SLICES,
): CidrBlock<IP, SLICES> {
    if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > maxPrefixLength) {
        throw new Error(
            `Invalid CIDR block ${address.toString()}/${prefixLength}, prefix length L must be 0 <= L <= ${maxPrefixLength}.`);
    }

    // Normalize by zeroing extra bits to the right of the prefix.
    address = address.mask(prefixLength);

    return {
        address,
        prefixLength,
        slice(slicePrefixLength: number) {
            return slice(this, slicePrefixLength);
        },
        toString() {
            return `${this.address.toString()}/${this.prefixLength}`;
        },
    };
}

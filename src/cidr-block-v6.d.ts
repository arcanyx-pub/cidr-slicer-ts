export interface CidrBlockV6 {
    /** The normalized address, with all bits right of the prefix as 0. */
    readonly addr: IpAddressV6;
    /** The prefix length specified by the notation, e.g., 60 for "2001:db8::/60". */
    readonly prefixLength: number;
    /**
     * Slice (i.e. partition) the block into smaller sub-blocks of the given slicePrefixLength.
     * Return the sub-block with the given sliceIndex in the resulting sub-block array.
     */
    readonly slice: (slicePrefixLength: number, sliceIndex: number) => CidrBlockV6;
    /** Returns the canonical string representation of the CIDR block (with proper elision) */
    readonly toCanonicalString: () => string;
}
export interface IpAddressV6 {
    readonly bigIntValue: bigint;
    readonly toCanonicalString: () => string;
}
export declare function parseCidrBlockV6(block: string): CidrBlockV6;
export declare function parseIpAddressV6(addrStr: string, maskWithPrefixLength?: number): IpAddressV6;

/** IPv6 Address */
export interface Ipv6Address {
    /** The 128-bit value of the address. */
    readonly bigIntValue: bigint,
    /** Convert to canonical string format, e.g., "2001:db8::1337". */
    readonly toString: () => string,
}

/** Parse an IPv6 address from its canonical string representation. */
export function ipv6AddressFromString(addrStr: string, maskWithPrefixLength?: number): Ipv6Address {
    if (addrStr.length == 0) {
        throw new Error("Cannot parse empty address");
    }
    // Split on the elision separator (::), if any.
    const [preElision, postElision, tooMuchElision] = addrStr.split("::", 3);
    if (tooMuchElision !== undefined) {
        throw new Error(`Cannot parse malformed "${addrStr}", contains more than one "::"!`);
    }

    // Split on group separators ":" and normalize by padding with zeros.
    const preElisionGroups = splitIntoGroups(preElision);
    const postElisionGroups = splitIntoGroups(postElision);
    const totalSpecifiedGroups = preElisionGroups.length + postElisionGroups.length;
    if (postElisionGroups.length > 0 && totalSpecifiedGroups > 6) {
        throw new Error(`Cannot parse malformed "${addrStr}", invalid use of elision (::).`);
    }

    // Restore the elided 0000 groups to finish reconstructing all 8 groups.
    const elidedGroups: string[] = Array<string>(8 - totalSpecifiedGroups).fill("0000");
    const allGroups = [...preElisionGroups, ...elidedGroups, ...postElisionGroups];

    // If any of the groups weren't valid hex, then an error will be thrown here.
    let bigIntValue = BigInt("0x".concat(allGroups.join("")));

    if (maskWithPrefixLength !== undefined) {
        const prefixLength = BigInt(maskWithPrefixLength);
        if (prefixLength < 0 || prefixLength > 64) {
            throw new Error(`Invalid prefix length: ${maskWithPrefixLength}`);
        }
        const bitsToWipeOut = 128n - prefixLength;
        bigIntValue >>= bitsToWipeOut;
        bigIntValue <<= bitsToWipeOut;
    }

    return ipv6AddressFromBigInt(bigIntValue);
}

/** Create an Ipv6Address from its 128-bit representation. */
export function ipv6AddressFromBigInt(bigIntValue: bigint): Ipv6Address {
    return {
        bigIntValue,
        toString: () => ipV6ToCanonicalString(bigIntValue),
    };
}

function ipV6ToCanonicalString(addr: bigint): string {
    // Break the 128-bit BigInt into 8 hextet groups.
    const hextetMask = 0xffffn;
    const groups = Array<number>(8);
    for (let i = 7; i >= 0; i--) {
        groups[i] = Number(addr & hextetMask);
        addr >>= 16n;
    }

    // Find the longest subsequence of zero-groups, or the first such subsequence if there is a tie.
    let zeroStart = -1;
    let zeroEnd = -1;
    let longestZeroLength = 0;
    let longestZeroStart = -1;
    for (let i = 0; i < 8; i++) {
        if (groups[i] != 0) {
            // If not zero, then continue (thus breaking the sequence).
            continue;
        }

        // Set zeroStart if we are starting a new sequence of zeros.
        if (zeroEnd != i) {
            zeroStart = i;
        }
        // Advance zeroEnd.
        zeroEnd = i + 1;

        const zeroLength = zeroEnd - zeroStart;
        if (zeroLength > longestZeroLength) {
            longestZeroLength = zeroLength;
            longestZeroStart = zeroStart;
        }
    }

    const groupStrs = groups.map(g => g.toString(16));

    // We never elide a single group of zeros, only two or more.
    if (longestZeroLength < 2) {
        return groupStrs.join(":");
    }

    return groupStrs.slice(0, longestZeroStart).join(":")
    .concat("::")
    .concat(groupStrs.slice(longestZeroStart + longestZeroLength).join(":"));
}

function splitIntoGroups(partialAddrStr: string | undefined) {
    if (partialAddrStr === undefined || partialAddrStr.length === 0) {
        return [];
    }

    const groups = partialAddrStr.split(":");

    // Return normalized groups w/ 4 chars each.
    return groups.map(group => {
        if (group.length == 0) {
            throw new Error("Encountered empty hextet group");
        }
        if (group.length > 4) {
            throw new Error(`Malformed IPv6 hextet group: ${group}`);
        }
        // Pad w/ leading zeros.
        return "0".repeat(4 - group.length).concat(group);
    });
}

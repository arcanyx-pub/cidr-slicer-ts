/*
IMPORTANT IMPLEMENTATION NOTE: In this module we are representing IPv4 addresses as uint32. But
JavaScript doesn't have uint32s, it has "numbers". When performing bitwise operations, numbers
are coerced to signed 32-bit ints in two's complement; so, if an int has 1 as its most significant
digit, then most JavaScript functions and operations will interpret that as a negative number. So we
have to be careful and write good tests.

See, e.g.: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
 */

/** IPv4 Address */
export type Ipv4Address = {
    /** Apply a mask using the given prefix length. */
    readonly mask: (prefixLength: number) => Ipv4Address,
    /** Convert to canonical string format, e.g., "192.0.2.0". */
    readonly toCanonicalString: () => string,
    /** Returns the numeric representation, in the range [0, 2^32) */
    readonly toNumber: () => number,
};

/** Parse an IPv4 address from its canonical string representation. */
export function ipv4AddressFromString(addrStr: string): Ipv4Address {
    if (addrStr.length == 0) {
        throw new Error("Cannot parse empty address");
    }

    const groups = addrStr.split(".");
    if (groups.length !== 4) {
        throw new Error(`Cannot parse malformed "${addrStr}", requires 4 groups.`);
    }

    let addrInt = 0;
    for (let i = 0; i < groups.length; i++) {
        const num = Number(groups[i]);
        if (!Number.isInteger(num) || num < 0 || num >= 256) {
            throw new Error(`Cannot parse malformed "${addrStr}", groups must be 0 <= g < 256.`);
        }
        addrInt |= (num << ((3 - i) * 8));
    }

    return ipv4AddressFromInt(addrInt);
}

/** Create an Ipv4Address from its numeric representation.
 *
 * `intValue` can be a number in [0, 2^32), and external users of this API will almost certainly
 * want it to be. However, you can also pass an int32-style number in [-2^31, 2^31), which we treat
 * as an unsigned integer.
 */
export function ipv4AddressFromInt(intValue: number): Ipv4Address {
    checkBounds(intValue);

    return {
        mask(prefixLength: number) {
            if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
                throw new Error(`Invalid mask prefix length: ${prefixLength}`);
            }
            if (prefixLength === 0) {
                return ipv4AddressFromInt(0);
            }
            // We make a mask by starting with a single leftmost 1-bit and doing a signed shift.
            const mask = MIN_INT32 >> (prefixLength - 1);
            const newVal = intValue & mask;

            return ipv4AddressFromInt(newVal);
        },

        toCanonicalString: () => ipv4ToCanonicalString(intValue),
        toNumber: () => (intValue + MAX_UINT32) % MAX_UINT32,
    };
}

function ipv4ToCanonicalString(addrVal: number): string {
    checkBounds(addrVal);

    const groups = Array<number>(4);
    const octetMask = 0xff;
    for (let i = 3; i >= 0; i--) {
        groups[i] = Number(addrVal & octetMask);
        addrVal >>= 8;
    }

    return groups.join(".");
}

const MIN_INT32 = 1 << 31;
const MAX_UINT32 = 0xffffffff;

// Since we are (ab)using the signed 32-bit representation of JavaScript's "number", any int
// with a most significant bit of 1 will be negative as far as '<' and '>' are concerned. We
// allow the "number" to be up to the maximum for uint32; if it is outside the range of int32, it
// will be represented as a double, but it will be correctly (for our case) coerced to int32 for
// bitwise operations.
function checkBounds(addrVal: number) {
    if (!Number.isInteger(addrVal) || addrVal < MIN_INT32 || addrVal > MAX_UINT32) {
        throw new Error(`Ipv4 int val out-of-bounds: ${addrVal}`);
    }
}

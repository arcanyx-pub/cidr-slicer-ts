import { describe, expect, test } from "vitest";
import { ipv6AddressFromBigInt, ipv6AddressFromString } from "./ipv6-address";

describe("Ipv6Address", () => {
    describe("ipv6AddressFromString", () => {
        const testParseAndReconstruct = (str: string, description?: string) =>
            test(`${description || "parses and reconstructs"}: "${str}"`, () =>
                expect(ipv6AddressFromString(str).toString()).toBe(str));

        testParseAndReconstruct("::");
        testParseAndReconstruct("::1");
        testParseAndReconstruct("2::1");
        testParseAndReconstruct("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
        // 1:0:0:4:0:0:0:8
        testParseAndReconstruct("1:0:0:4::8", "elides longest set of zeroes");
        // 1:0:0:4:0:0:7:8
        testParseAndReconstruct("1::4:0:0:7:8", "elides the 1st of equal-length sets of zeros");
    });

    describe("ipv6AddressFromString: accepts valid boundary forms", () => {
        // "::" eliding exactly one group, with the maximum 7 groups written out
        // across it (2 before, 5 after).
        test('expands a 7-group address split across "::"', () =>
            expect(ipv6AddressFromString("1:2::4:5:6:7:8").toString()).toBe("1:2:0:4:5:6:7:8"));
        // All 8 groups written out, no elision.
        test("accepts a full 8-group address with no elision", () =>
            expect(ipv6AddressFromString("1:2:3:4:5:6:7:8").toString()).toBe("1:2:3:4:5:6:7:8"));
    });

    describe("ipv6AddressFromString: rejects malformed input", () => {
        const testRejects = (str: string, messagePart: string, description: string) =>
            test(description, () => expect(() => ipv6AddressFromString(str)).toThrow(messagePart));

        testRejects("", "empty", "empty string");
        // No "::": all 8 groups must be written out explicitly.
        testRejects("1:2:3", "expected 8 groups", "too few groups, no elision");
        testRejects("dead:beef", "expected 8 groups", "far too few groups, no elision");
        testRejects("1:2:3:4:5:6:7", "expected 8 groups", "seven groups, no elision");
        // More than 8 groups is a wrong count, rejected with the same clear message.
        testRejects("1:2:3:4:5:6:7:8:9", "expected 8 groups", "nine groups, no elision");
        // "::" must elide at least one group, so <= 7 may be written out.
        testRejects(
            "1:2:3:4:5:6:7:8::",
            "must elide at least one group",
            "eight groups plus a redundant ::",
        );
        testRejects(
            "1:2:3:4:5:6:7:8:9::",
            "must elide at least one group",
            "over-full with elision",
        );
        testRejects("a::b::c", "more than one", "two elisions");
    });

    describe("ipv6AddressFromBigInt", () => {
        const testIntToString = (intVal: bigint, strVal: string) =>
            test(`${intVal} => "${strVal}"`, () =>
                expect(ipv6AddressFromBigInt(intVal).toString()).toBe(strVal));

        testIntToString(0n, "::");
        testIntToString(1n, "::1");
        testIntToString(15n, "::f");
        testIntToString(16n, "::10");
        testIntToString(1n << 16n, "::1:0");
        testIntToString((1n << 112n) + 1n, "1::1");
        testIntToString(1n << 127n, "8000::");
        testIntToString((1n << 128n) - 1n, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
    });

    describe("Ipv6Address.toBigInt()", () => {
        test('"::" => 0n', () => expect(ipv6AddressFromString("::").toBigInt()).toBe(0n));
        test('"::1" => 1n', () => expect(ipv6AddressFromString("::1").toBigInt()).toBe(1n));
        test("2001:db8:: => full 128-bit value", () =>
            expect(ipv6AddressFromString("2001:db8::").toBigInt()).toBe(
                42540766411282592856903984951653826560n,
            ));

        // Round-trips the value handed to the constructor.
        for (const v of [0n, 1n, (1n << 64n) + 7n, (1n << 128n) - 1n]) {
            test(`round-trips ${v}`, () => expect(ipv6AddressFromBigInt(v).toBigInt()).toBe(v));
        }
    });

    describe("Ipv6Address.mask()", () => {
        const testMaskedAddress = (addr: string, mask: number, expected: string) =>
            test(`${addr} masked with /${mask} is ${expected}`, () =>
                expect(ipv6AddressFromString(addr).mask(mask).toString()).toBe(expected));

        testMaskedAddress("::", 0, "::");
        testMaskedAddress("::", 128, "::");

        const maxAddr = "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff";
        testMaskedAddress(maxAddr, 0, "::");
        testMaskedAddress(maxAddr, 1, "8000::");
        testMaskedAddress(maxAddr, 16, "ffff::");
        testMaskedAddress(maxAddr, 64, "ffff:ffff:ffff:ffff::");
        testMaskedAddress(maxAddr, 128, maxAddr);
    });
});

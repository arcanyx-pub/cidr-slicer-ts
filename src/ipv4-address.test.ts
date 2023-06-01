import {ipv4AddressFromInt, ipv4AddressFromString} from "./ipv4-address";
import {describe, expect, test} from "@jest/globals";

describe("Ipv4Address", () => {
    describe("ipv4AddressFromString", () => {
        const testParseAndReconstruct = (str: string, description?: string) =>
              test(
                    `${description || "parses and reconstructs"}: "${str}"`,
                    () => expect(ipv4AddressFromString(str).toCanonicalString()).toBe(str));

        testParseAndReconstruct("0.0.0.0");
        testParseAndReconstruct("0.0.0.1");
        testParseAndReconstruct("2.0.0.1");
        testParseAndReconstruct("128.0.0.1");
        testParseAndReconstruct("255.255.255.255");
    });

    describe("ipv4AddressFromInt", () => {
        const testIntToString = (intVal: number, strVal: string, description?: string) =>
              test(
                  `${intVal} => "${strVal}"` + (description ? ` (${description})` : ""),
                  () => expect(ipv4AddressFromInt(intVal).toCanonicalString()).toBe(strVal));

        const MAX_UINT32 = 0xffffffff;
        const MIN_INT32 = 1 << 31;

        testIntToString(0, "0.0.0.0");
        testIntToString(1, "0.0.0.1");
        testIntToString(9, "0.0.0.9");
        testIntToString(10, "0.0.0.10");
        testIntToString(1 << 8, "0.0.1.0");
        testIntToString((1 << 24) + 1, "1.0.0.1");
        testIntToString(MAX_UINT32, "255.255.255.255", "max uint32");
        testIntToString(-1, "255.255.255.255", "-1, i.e., max uint32 as int32");
        testIntToString(MIN_INT32, "128.0.0.0", "min int32, i.e., single leading 1-bit");

        test("throws if out-of-bounds", () => {
            expect(() => ipv4AddressFromInt(MIN_INT32 - 1)).toThrow("out-of-bounds");
            expect(() => ipv4AddressFromInt(MAX_UINT32 + 1)).toThrow("out-of-bounds");
        });
    });

    describe("Ipv4Address.mask()", () => {
        const testMaskedAddress = (addr: string, mask: number, expected: string) =>
            test(
                `${addr} masked with /${mask} is ${expected}`,
                () => expect(ipv4AddressFromString(addr).mask(mask).toCanonicalString()).toBe(expected));

        testMaskedAddress("0.0.0.0", 0, "0.0.0.0");
        testMaskedAddress("0.0.0.0", 32, "0.0.0.0");

        testMaskedAddress("255.255.255.255", 0, "0.0.0.0");
        testMaskedAddress("255.255.255.255", 1, "128.0.0.0");
        testMaskedAddress("255.255.255.255", 8, "255.0.0.0");
        testMaskedAddress("255.255.255.255", 24, "255.255.255.0");
        testMaskedAddress("255.255.255.255", 32, "255.255.255.255");

        testMaskedAddress("1.2.3.4", 0, "0.0.0.0");
        testMaskedAddress("1.2.3.4", 14, "1.0.0.0");
        testMaskedAddress("1.2.3.4", 15, "1.2.0.0");
        testMaskedAddress("1.2.3.4", 16, "1.2.0.0");
        testMaskedAddress("1.2.3.4", 32, "1.2.3.4");
    });
});

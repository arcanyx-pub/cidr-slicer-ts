import {ipv6AddressFromBigInt, ipv6AddressFromString} from "./ipv6-address";
import {describe, expect, test} from "@jest/globals";

describe("Ipv6Address", () => {
    describe("ipv6AddressFromString", () => {
        const testParseAndReconstruct = (str: string, description?: string) =>
              test(
                    `${description || "parses and reconstructs"}: "${str}"`,
                    () => expect(ipv6AddressFromString(str).toCanonicalString()).toBe(str));

        testParseAndReconstruct("::");
        testParseAndReconstruct("::1");
        testParseAndReconstruct("2::1");
        testParseAndReconstruct("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
        // 1:0:0:4:0:0:0:8
        testParseAndReconstruct("1:0:0:4::8", "elides longest set of zeroes");
        // 1:0:0:4:0:0:7:8
        testParseAndReconstruct("1::4:0:0:7:8", "elides the 1st of equal-length sets of zeros");

    });

    describe("ipv6AddressFromBigInt", () => {
        const testIntToString = (intVal: bigint, strVal: string) =>
              test(
                    `${intVal} => "${strVal}"`,
                    () => expect(ipv6AddressFromBigInt(intVal).toCanonicalString()).toBe(strVal));

        testIntToString(0n, "::");
        testIntToString(1n, "::1");
        testIntToString(15n, "::f");
        testIntToString(16n, "::10");
        testIntToString(1n << 16n, "::1:0");
        testIntToString((1n << 112n) + 1n, "1::1");
        testIntToString(1n << 127n, "8000::");
        testIntToString((1n << 128n) - 1n, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
    });
});

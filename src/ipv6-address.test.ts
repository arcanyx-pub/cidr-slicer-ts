import {ipv6AddressFromBigInt, ipv6AddressFromString} from "./ipv6-address";
import {describe, expect, test} from "@jest/globals";

describe("Ipv6Address", () => {
    describe("ipv6AddressFromString", () => {
        test("parses and outputs '::'", () => {
            expect(ipv6AddressFromString("::").toCanonicalString()).toBe("::");
        });
        test("parses and outputs '::1'", () => {
            expect(ipv6AddressFromString("::1").toCanonicalString()).toBe("::1");
        });
        test("parses and outputs '2::1'", () => {
            expect(ipv6AddressFromString("2::1").toCanonicalString()).toBe("2::1");
        });
        test("elides only one set of zeroes: '1::4:0:0:7:8'", () => {
            expect(ipv6AddressFromString("1::4:0:0:7:8").toCanonicalString()).toBe("1::4:0:0:7:8");
        });
        test("elides longest set of zeroes: '1:0:0:4::8'", () => {
            expect(ipv6AddressFromString("1:0:0:4::8").toCanonicalString()).toBe("1:0:0:4::8");
        });
    });

    describe("ipv6AddressFromBigInt", () => {
        test("0 => ::", () => {
            expect(ipv6AddressFromBigInt(0n).toCanonicalString()).toBe("::");
        });
        test("1 => ::1", () => {
            expect(ipv6AddressFromBigInt(1n).toCanonicalString()).toBe("::1");
        });
        test("15 => ::f", () => {
            expect(ipv6AddressFromBigInt(15n).toCanonicalString()).toBe("::f");
        });
        test("16 => ::10", () => {
            expect(ipv6AddressFromBigInt(16n).toCanonicalString()).toBe("::10");
        });
        test("2^^16 => ::1:0", () => {
            expect(ipv6AddressFromBigInt(1n << 16n).toCanonicalString()).toBe("::1:0");
        });
        test("2^^112 + 1 => 1::1", () => {
            expect(ipv6AddressFromBigInt((1n << 112n) + 1n).toCanonicalString()).toBe("1::1");
        });
        test("2^^127 => 8000::", () => {
            expect(ipv6AddressFromBigInt(1n << 127n).toCanonicalString()).toBe("8000::");
        });
        test("2^^128 - 1 => ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", () => {
            expect(ipv6AddressFromBigInt((1n << 128n) - 1n).toCanonicalString())
            .toBe("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
        });
    });
});

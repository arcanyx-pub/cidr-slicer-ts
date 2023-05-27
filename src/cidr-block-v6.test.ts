import {parseCidrBlockV6, parseIpAddressV6} from "./cidr-block-v6";
import {describe, expect, test} from "@jest/globals";

describe("IpAddressV6", () => {
    test("parses and outputs '::'", () => {
        expect(parseIpAddressV6("::").toCanonicalString()).toBe("::");
    });
    test("parses and outputs '::1'", () => {
        expect(parseIpAddressV6("::1").toCanonicalString()).toBe("::1");
    });
    test("parses and outputs '2::1'", () => {
        expect(parseIpAddressV6("2::1").toCanonicalString()).toBe("2::1");
    });
    test("elides only one set of zeroes: '1::4:0:0:7:8'", () => {
        expect(parseIpAddressV6("1::4:0:0:7:8").toCanonicalString()).toBe("1::4:0:0:7:8");
    });
    test("elides longest set of zeroes: '1:0:0:4::8'", () => {
        expect(parseIpAddressV6("1:0:0:4::8").toCanonicalString()).toBe("1:0:0:4::8");
    });
})

describe("CidrBlockV6", () => {
    test("parses '::'", () => {
        expect(parseCidrBlockV6("::/0").toCanonicalString()).toBe("::/0");
    });
    test("parses and slices '1:20:3000:beef::/64'", () => {
        const block = parseCidrBlockV6("1:20:3000:beef::/64");
        expect(block.toCanonicalString()).toBe("1:20:3000:beef::/64");
        expect(block.slice(64, 0).toCanonicalString()).toBe("1:20:3000:beef::/64");
    });
    test("parses and slices '1:2:3:400::/56'", () => {
        const block = parseCidrBlockV6("1:2:3:400::/56");
        expect(block.toCanonicalString()).toBe("1:2:3:400::/56");
        expect(block.slice(64, 0).toCanonicalString()).toBe("1:2:3:400::/64");
        expect(block.slice(64, 1).toCanonicalString()).toBe("1:2:3:401::/64");
        expect(block.slice(64, 255).toCanonicalString()).toBe("1:2:3:4ff::/64");
    });
    test("parses and slices '0:2:3::/48'", () => {
        const block = parseCidrBlockV6("0:2:3::/48");
        expect(block.toCanonicalString()).toBe("0:2:3::/48");
        expect(block.slice(56, 0).toCanonicalString()).toBe("0:2:3::/56");
        expect(block.slice(56, 1).toCanonicalString()).toBe("0:2:3:100::/56");
        expect(block.slice(56, 255).toCanonicalString()).toBe("0:2:3:ff00::/56");
    });
});

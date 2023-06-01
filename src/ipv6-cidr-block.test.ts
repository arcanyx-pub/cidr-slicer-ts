import {ipv6CidrBlockFromString} from "./ipv6-cidr-block";
import {describe, expect, test} from "@jest/globals";

describe("Ipv6CidrBlock", () => {
    test("parses '::'", () => {
        expect(ipv6CidrBlockFromString("::/0").toCanonicalString()).toBe("::/0");
    });
    test("parses and slices '1:20:3000:beef::/64'", () => {
        const block = ipv6CidrBlockFromString("1:20:3000:beef::/64");
        expect(block.toCanonicalString()).toBe("1:20:3000:beef::/64");
        expect(block.slice(64, 0).toCanonicalString()).toBe("1:20:3000:beef::/64");
    });
    test("parses and slices '1:2:3:400::/56'", () => {
        const block = ipv6CidrBlockFromString("1:2:3:400::/56");
        expect(block.toCanonicalString()).toBe("1:2:3:400::/56");
        expect(block.slice(64, 0).toCanonicalString()).toBe("1:2:3:400::/64");
        expect(block.slice(64, 1).toCanonicalString()).toBe("1:2:3:401::/64");
        expect(block.slice(64, 255).toCanonicalString()).toBe("1:2:3:4ff::/64");
    });
    test("parses and slices '0:2:3::/48'", () => {
        const block = ipv6CidrBlockFromString("0:2:3::/48");
        expect(block.toCanonicalString()).toBe("0:2:3::/48");
        expect(block.slice(56, 0).toCanonicalString()).toBe("0:2:3::/56");
        expect(block.slice(56, 1).toCanonicalString()).toBe("0:2:3:100::/56");
        expect(block.slice(56, 255).toCanonicalString()).toBe("0:2:3:ff00::/56");
    });
});

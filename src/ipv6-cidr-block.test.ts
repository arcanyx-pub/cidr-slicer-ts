import {ipv6CidrBlockFromString} from "./ipv6-cidr-block";
import {describe, expect, test} from "@jest/globals";

describe("Ipv6CidrBlock", () => {

    test("parses '::'", () => {
        expect(ipv6CidrBlockFromString("::/0").toString()).toBe("::/0");
    });

    test("parses and slices '1:20:3000:beef::/64' into one /64 block", () => {
        const block = ipv6CidrBlockFromString("1:20:3000:beef::/64");
        expect(block.toString()).toBe("1:20:3000:beef::/64");

        const slices = block.slice(64);
        expect(slices.length).toBe(1n);
        expect(slices.get(0n).toString()).toBe("1:20:3000:beef::/64");
    });

    test("parses and slices '1:2:3:400::/56' into /64 blocks", () => {
        const block = ipv6CidrBlockFromString("1:2:3:400::/56");
        expect(block.toString()).toBe("1:2:3:400::/56");

        const slices = block.slice(64);
        expect(slices.length).toBe(256n);
        expect(slices.get(0n).toString()).toBe("1:2:3:400::/64");
        expect(slices.get(1n).toString()).toBe("1:2:3:401::/64");
        expect(slices.get(255n).toString()).toBe("1:2:3:4ff::/64");
    });

    test("parses and slices '0:2:3::/48' into /56 blocks", () => {
        const block = ipv6CidrBlockFromString("0:2:3::/48");
        expect(block.toString()).toBe("0:2:3::/48");

        const slices = block.slice(56);
        expect(slices.get(0n).toString()).toBe("0:2:3::/56");
        expect(slices.get(1n).toString()).toBe("0:2:3:100::/56");
        expect(slices.get(255n).toString()).toBe("0:2:3:ff00::/56");
    });

    test("slices.get(i) throws error for out-of-bounds i", () => {
        const block = ipv6CidrBlockFromString("::/64");
        const slices = block.slice(64);

        expect(slices.length).toBe(1n);
        expect(() => slices.get(1n)).toThrow("Out-of-bounds");
        expect(() => slices.get(-1n)).toThrow("Out-of-bounds");
    });

});

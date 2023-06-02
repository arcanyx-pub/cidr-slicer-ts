import {ipv4CidrBlockFromString} from "./ipv4-cidr-block";
import {describe, expect, test} from "@jest/globals";

describe("Ipv4CidrBlock", () => {

    describe("ipv4CidrBlockFromString: parses and reconstructs canonical strings", () => {
        const testParseAndReconstruct = (str: string, description?: string) =>
            test(
                `${str} ${description ?? ""}`,
                () => expect(ipv4CidrBlockFromString(str).toString()).toBe(str));

        testParseAndReconstruct("0.0.0.0/0");
        testParseAndReconstruct("0.0.0.0/16");
        testParseAndReconstruct("0.0.0.0/32");

        testParseAndReconstruct("128.0.0.0/1", "leftmost bit set to 1");
        testParseAndReconstruct("255.0.0.0/8");
        testParseAndReconstruct("255.255.0.0/16");
        testParseAndReconstruct("255.255.255.0/24");
        testParseAndReconstruct("255.255.255.255/32");

        testParseAndReconstruct("0.0.0.1/32", "rightmost bit set to 1");
        testParseAndReconstruct("128.0.0.1/32", "leftmost and rightmost bits set to 1");
    });

    describe("ipv4CidrBlockFromString: normalizes by removing extra bits", () => {
        const testNormalize = (str: string, expected: string, description?: string) =>
            test(
                `${str} => ${expected} ${description ?? ""}`,
                () => expect(ipv4CidrBlockFromString(str).toString()).toBe(expected));

        testNormalize("255.255.255.255/0", "0.0.0.0/0");
        testNormalize("255.255.255.255/8", "255.0.0.0/8");
        testNormalize("255.255.255.255/16", "255.255.0.0/16");
        testNormalize("255.255.255.255/24", "255.255.255.0/24");
        testNormalize("255.255.255.255/32", "255.255.255.255/32");
    });

    describe("slicing", () => {

        test("parses and slices '255.255.255.255/32' into one /32 block", () => {
            const block = ipv4CidrBlockFromString("255.255.255.255/32");
            expect(block.toString()).toBe("255.255.255.255/32");

            const slices = block.slice(32);
            expect(slices.length).toBe(1);
            expect(slices.get(0).toString()).toBe("255.255.255.255/32");
        });

        test("parses and slices '0.0.0.0/0' into one /0 block", () => {
            const block = ipv4CidrBlockFromString("0.0.0.0/0");
            expect(block.toString()).toBe("0.0.0.0/0");

            const slices = block.slice(0);
            expect(slices.length).toBe(1);
            expect(slices.get(0).toString()).toBe("0.0.0.0/0");
        });

        test("parses and slices '0.0.0.0/0' into 2^32 /32 blocks", () => {
            const block = ipv4CidrBlockFromString("0.0.0.0/0");
            expect(block.toString()).toBe("0.0.0.0/0");

            const slices = block.slice(32);
            expect(slices.length).toBe(2 ** 32);
            expect(slices.get(0).toString()).toBe("0.0.0.0/32");
            expect(slices.get(1).toString()).toBe("0.0.0.1/32");
            expect(slices.get(2 ** 32 - 1).toString()).toBe("255.255.255.255/32");
        });

        test("parses and slices '128.0.0.0/1' into 2^31 /32 blocks", () => {
            const block = ipv4CidrBlockFromString("128.0.0.0/1");
            expect(block.toString()).toBe("128.0.0.0/1");

            const slices = block.slice(32);
            expect(slices.length).toBe(2 ** 31);
            expect(slices.get(0).toString()).toBe("128.0.0.0/32");
            expect(slices.get(1).toString()).toBe("128.0.0.1/32");
            expect(slices.get(2 ** 31 - 1).toString()).toBe("255.255.255.255/32");
        });

        test("parses and slices '0.0.0.0/0' into 2^31 /31 blocks", () => {
            const block = ipv4CidrBlockFromString("0.0.0.0/0");
            expect(block.toString()).toBe("0.0.0.0/0");

            const slices = block.slice(31);
            expect(slices.length).toBe(2 ** 31);
            expect(slices.get(0).toString()).toBe("0.0.0.0/31");
            expect(slices.get(1).toString()).toBe("0.0.0.2/31");
            expect(slices.get(2 ** 31 - 1).toString()).toBe("255.255.255.254/31");
        });

        test("parses and slices '255.255.0.0/16' into 255 /24 blocks", () => {
            const block = ipv4CidrBlockFromString("255.255.0.0/16");
            expect(block.toString()).toBe("255.255.0.0/16");

            const slices = block.slice(24);
            expect(slices.length).toBe(256);
            expect(slices.get(0).toString()).toBe("255.255.0.0/24");
            expect(slices.get(1).toString()).toBe("255.255.1.0/24");
            expect(slices.get(255).toString()).toBe("255.255.255.0/24");
        });


        test("slices.get(i) throws error for out-of-bounds i", () => {
            const block = ipv4CidrBlockFromString("0.0.0.0/32");
            const slices = block.slice(32);

            expect(slices.length).toBe(1);
            expect(() => slices.get(1)).toThrow("Out-of-bounds");
            expect(() => slices.get(-1)).toThrow("Out-of-bounds");
        });
    });
});

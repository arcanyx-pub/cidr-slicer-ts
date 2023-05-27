"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cidr_block_v6_1 = require("./cidr-block-v6");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)("IpAddressV6", () => {
    (0, globals_1.test)("parses and outputs '::'", () => {
        (0, globals_1.expect)((0, cidr_block_v6_1.parseIpAddressV6)("::").toCanonicalString()).toBe("::");
    });
    (0, globals_1.test)("parses and outputs '::1'", () => {
        (0, globals_1.expect)((0, cidr_block_v6_1.parseIpAddressV6)("::1").toCanonicalString()).toBe("::1");
    });
    (0, globals_1.test)("parses and outputs '2::1'", () => {
        (0, globals_1.expect)((0, cidr_block_v6_1.parseIpAddressV6)("2::1").toCanonicalString()).toBe("2::1");
    });
    (0, globals_1.test)("elides only one set of zeroes: '1::4:0:0:7:8'", () => {
        (0, globals_1.expect)((0, cidr_block_v6_1.parseIpAddressV6)("1::4:0:0:7:8").toCanonicalString()).toBe("1::4:0:0:7:8");
    });
    (0, globals_1.test)("elides longest set of zeroes: '1:0:0:4::8'", () => {
        (0, globals_1.expect)((0, cidr_block_v6_1.parseIpAddressV6)("1:0:0:4::8").toCanonicalString()).toBe("1:0:0:4::8");
    });
});
(0, globals_1.describe)("CidrBlockV6", () => {
    (0, globals_1.test)("parses '::'", () => {
        (0, globals_1.expect)((0, cidr_block_v6_1.parseCidrBlockV6)("::/0").toCanonicalString()).toBe("::/0");
    });
    (0, globals_1.test)("parses and slices '1:20:3000:beef::/64'", () => {
        const block = (0, cidr_block_v6_1.parseCidrBlockV6)("1:20:3000:beef::/64");
        (0, globals_1.expect)(block.toCanonicalString()).toBe("1:20:3000:beef::/64");
        (0, globals_1.expect)(block.slice(64, 0).toCanonicalString()).toBe("1:20:3000:beef::/64");
    });
    (0, globals_1.test)("parses and slices '1:2:3:400::/56'", () => {
        const block = (0, cidr_block_v6_1.parseCidrBlockV6)("1:2:3:400::/56");
        (0, globals_1.expect)(block.toCanonicalString()).toBe("1:2:3:400::/56");
        (0, globals_1.expect)(block.slice(64, 0).toCanonicalString()).toBe("1:2:3:400::/64");
        (0, globals_1.expect)(block.slice(64, 1).toCanonicalString()).toBe("1:2:3:401::/64");
        (0, globals_1.expect)(block.slice(64, 255).toCanonicalString()).toBe("1:2:3:4ff::/64");
    });
    (0, globals_1.test)("parses and slices '0:2:3::/48'", () => {
        const block = (0, cidr_block_v6_1.parseCidrBlockV6)("0:2:3::/48");
        (0, globals_1.expect)(block.toCanonicalString()).toBe("0:2:3::/48");
        (0, globals_1.expect)(block.slice(56, 0).toCanonicalString()).toBe("0:2:3::/56");
        (0, globals_1.expect)(block.slice(56, 1).toCanonicalString()).toBe("0:2:3:100::/56");
        (0, globals_1.expect)(block.slice(56, 255).toCanonicalString()).toBe("0:2:3:ff00::/56");
    });
});
//# sourceMappingURL=cidr-block-v6.test.js.map
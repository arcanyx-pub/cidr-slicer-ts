# Cidr Slicer 🔪🍎
=====

[![npm](https://img.shields.io/npm/v/@arcanyx/cidr-slicer)](https://www.npmjs.com/package/@arcanyx/cidr-slicer)

Tiny zero-dependency lib for manipulating CIDR blocks in both IPv4 and IPv6. Written in TypeScript.

```shell
npm install @arcanyx/cidr-slicer
```

**CAUTION**: This is an early version with several limitations:
 - No IPv4 support.
 - Insufficient test coverage.
 - Not performance-optimized.
 - API will almost certainly change in v1.
 - Contributions welcome!

Features:
 - Parse an IPv6 address (e.g., `2001:db8::`) into a 128-bit BigInt.
 - Parse a CIDR block (e.g., `2001:db8::/56`) into a 128-bit BigInt + prefix length.
 - Slice a CIDR block into smaller blocks, e.g.,
   `2001:db8:0:b00::/56` -> `["2001:db8:0:b00::/64", "2001:db8:0:b01::/64", "2001:db8:0:b02::/64", ...]`

Use cases:
 - Dynamically creating subnets when issued a block of IPv6 addresses via prefix delegation.

## Example

### General Usage

```typescript
import {parseCidrBlockV6, CidrBlockV6} from "cidr-slicer";

const block: CidrBlockV6 = parseCidrBlockV6("2001:db8::/56");

for (let i = 0; i < 3; i++) {
    // Slice the /56 block into smaller /64 blocks and get the i'th block.
    const slice: CidrBlockV6 = block.slice(64, i);
    console.log(slice.toCanonicalString());
}
// Outputs:
//  2001:db8::/64
//  2001:db8:0:1::/64
//  2001:db8:0:2::/64

// Throws an error because there are only 256 /64 blocks in a /56 block:
const slice = block.slice(64, 256);  // throws!
```

### Assigning IPv6 blocks to AWS subnets with AWS CDK

TODO: Write this section

### Assigning IPv6 blocks to AWS subnets with Pulumi

TODO: Write this section

### Assigning IPv6 blocks to AWS subnets with CDKTF (CDK for Terraform)

TODO: Write this section

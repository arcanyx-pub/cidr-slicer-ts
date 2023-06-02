CIDR::/slicer 🔪🍎
================

[![npm](https://img.shields.io/npm/v/@arcanyx/cidr-slicer)](https://www.npmjs.com/package/@arcanyx/cidr-slicer)
[![main](https://github.com/arcanyx-pub/cidr-slicer-ts/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/arcanyx-pub/cidr-slicer-ts/actions?query=branch%3Amain)

Tiny zero-dependency lib for manipulating CIDR blocks (IPv4 and IPv6). Written in TypeScript.

```shell
npm install @arcanyx/cidr-slicer
```

**CAUTION**: This is an early version with several limitations:
 - No IPv4 support.

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
import {ipv6CidrBlockFromString} from "cidr-slicer";

// Slice a /56 block into /64 block slices.
const block = ipv6CidrBlockFromString("2001:db8::/56");  // Type: CidrBlock<Ipv6Address>
const slices = block.slice(64);  // Type: Ipv6CidrBlockSlices

for (let i = 0; i < slices.length; i++) {
   // Get and print the i'th block slice.
    const slice = slices.get(i);  // Type: CidrBlock<Ipv6Address>
    console.log(`slice ${i}: ${slice}`);
}
// Console output:
//  slice 0: 2001:db8::/64
//  slice 1: 2001:db8:0:1::/64
//  slice 2: 2001:db8:0:2::/64
//  [...]
//  slice 255: 2001:db8:0:ff::/64
```

### Assigning IPv6 blocks to AWS subnets with AWS CDK

TODO: Write this section

### Assigning IPv6 blocks to AWS subnets with Pulumi

TODO: Write this section

### Assigning IPv6 blocks to AWS subnets with CDKTF (CDK for Terraform)

TODO: Write this section

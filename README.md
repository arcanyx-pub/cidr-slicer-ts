CIDR::/slicer 🔪🍎
================

[![npm](https://img.shields.io/npm/v/@arcanyx/cidr-slicer)](https://www.npmjs.com/package/@arcanyx/cidr-slicer)
[![main](https://github.com/arcanyx-pub/cidr-slicer-ts/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/arcanyx-pub/cidr-slicer-ts/actions?query=branch%3Amain)

Zero-dependency lib for manipulating IP Addresses & CIDR blocks (IPv4 and IPv6). Written in TypeScript.

```shell
npm install @arcanyx/cidr-slicer
```

Features:
 - Parse IP addresses:
   ```typescript
   ipv6AddressFromString("2001:db8::").toString()  // "2001:db8::"
   ipv6AddressFromString("2001:db8::").bigIntValue // 42540766411282592856903984951653826560n
   ```
   
 - Mask IP addresses w/ a prefix length:
   ```typescript
   ipv4AddressFromString("1.1.1.1").mask(16).toString()  // "1.1.0.0"
   ```

 - Parse CIDR blocks:
   ```typescript
   ipv6CidrBlockFromString("2001:db8::/64").prefixLength  // 64
   ```

 - Slice CIDR blocks into smaller blocks:
   ```typescript
   const slices = ipv6CidrBlockFromString("2001:db8::/32").slice(48);
   slices.get(0n).toString();  // "2001:db8::/48"
   slices.get(1n).toString();  // "2001:db8:1::/48"
   ```

- Slice CIDR blocks into smaller blocks, and slice those blocks into even smaller blocks:
  ```typescript
  const slices = ipv6CidrBlockFromString("2001:db8::/32").slice(48);
  const subslices = slices.get(1n).slice(64);
  subslices.get(1n).toString() // "2001:db8:1:1::/64
  ```

## Examples

### Slice IPv6 CIDR Blocks into smaller blocks.

```typescript
import {ipv6CidrBlockFromString} from "cidr-slicer";

// Slice a /56 block into /64 block slices.
const block = ipv6CidrBlockFromString("2001:db8::/56");  // Type: CidrBlock<Ipv6Address>
const slices = block.slice(64);  // Type: Ipv6CidrBlockSlices

for (let i = 0n; i < slices.length; i++) {
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

## Use Cases

### Assigning IPv6 blocks to AWS subnets with AWS CDK

TODO: Write this section

### Assigning IPv6 blocks to AWS subnets with Pulumi

TODO: Write this section

### Assigning IPv6 blocks to AWS subnets with CDKTF (CDK for Terraform)

TODO: Write this section

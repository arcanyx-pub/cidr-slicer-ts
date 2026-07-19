# Changelog

Notable changes to `@arcanyx/cidr-slicer`. Format follows
[Keep a Changelog](https://keepachangelog.com); versions follow
[SemVer](https://semver.org).

## [1.0.0] - 2026-07-19

### Breaking

- Removed the public `uintValue` field from `Ipv4Address` and `bigIntValue`
  from `Ipv6Address`. Use `toNumber()` / `toBigInt()` (IPv4) or `toBigInt()`
  (IPv6) instead — both return the canonical unsigned value. (`uintValue` was
  also non-canonical: the same address stored differently depending on the
  constructor.)
- The package is now ESM-first (`"type": "module"`), shipping both ESM and
  CommonJS behind an `exports` map. `import` and `require` both resolve the
  right build, but deep imports into `dist/*` internals are no longer
  resolvable — import from the package root.
- Requires Node.js >= 22.

### Added

- `toBigInt()` on both `Ipv4Address` and `Ipv6Address`.
- `Ipv4CidrBlockSlices` and `Ipv6CidrBlockSlices` are now exported from the
  package root (previously reachable only by deep-importing internal modules).

### Fixed

- `Ipv4Address.toNumber()` returned a value one too small for any address with
  the high bit set (>= `128.0.0.0`); it now returns the correct unsigned
  integer.
- The IPv6 parser silently accepted malformed addresses (too few or too many
  groups without `::`, or a redundant trailing `::`) and could leak an
  "Invalid array length" error. It now rejects them with clear messages, while
  correctly accepting valid forms such as `1:2::4:5:6:7:8` that it previously
  rejected.

## [0.3.0] and earlier

Release history prior to this changelog is recorded in the git log.

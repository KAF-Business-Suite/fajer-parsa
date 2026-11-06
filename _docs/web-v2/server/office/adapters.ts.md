<!-- METADATA: {"source_path": "web-v2/server/office/adapters.ts", "source_sha": "97676dfc118b16c6eb6555bc82c32afac18ac1f8", "extraction_quality": "structural", "model": "gpt-5-mini", "generated_at": "2026-10-31T02:49:20Z", "doc_type": "file"} -->
<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "web-v2/server/office/adapters.ts",
  "source_hash": "deb9c73c9ed6d2e63d3dffa43ae2b5983691050acf6bb7c2f2ebd6453d659695",
  "last_updated": "2026-10-31T02:49:19.422468+00:00",
  "git_sha": "97676dfc118b16c6eb6555bc82c32afac18ac1f8",
  "tokens_used": 3678,
  "complexity_score": 2,
  "estimated_review_time_minutes": 5,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../README.md) > [web-v2](../../README.md) > [server](../README.md) > [office](./README.md) > **adapters**

---

# adapters.ts

> **File:** `web-v2/server/office/adapters.ts`

![Complexity: Low](https://img.shields.io/badge/Complexity-Low-green) ![Review Time: 5min](https://img.shields.io/badge/Review_Time-5min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This TypeScript module declares two interfaces and three module-level factory/helper functions which together act as adapters for office-related data and dependency construction. The file exports interfaces named Config and Row to shape configuration and row-like data structures, and it exposes functions object, row, and officeDependencies. The module also imports two specific error classes, OfficeDenied and OfficeConflict, from a handler module, indicating it interacts with or signals those application-level error conditions when constructing or validating office-related artifacts.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| `./handler.ts` | import { OfficeDenied, OfficeConflict } from './handler.ts' |

## 📁 Directory

This file is part of the **office** directory. View the [directory index](./README.md) to see all files in this module.

## Architecture Notes

- Defines TypeScript interfaces to model data shapes (Config, Row).
- Exposes module-level factory/helper functions rather than class methods.
- Imports and references application-specific error classes (OfficeDenied, OfficeConflict) from a handler module.

## Maintenance Notes

- Declare the Config interface to describe configuration shape used by the office adapters.
- Declare the Row interface to represent row-shaped data structures manipulated by the adapters.
- Provide the object() function as a module-level factory or transformer for building/normalizing object-shaped data.
- Provide the row() function as a module-level factory or transformer for building/normalizing Row instances.
- Provide the officeDependencies() function to construct or return office-related dependencies, and to surface OfficeDenied or OfficeConflict where relevant.


---

## Functions and Classes


### Config

![Type: Abstract](https://img.shields.io/badge/Type-Abstract-purple)

#### Description

Config is an interface that defines the shape of configuration data used by the office adapter layer.

Within web-v2/server/office/adapters.ts, Config acts as the central type contract for adapter configuration; other functions and classes in the file refer to it to guarantee they receive configuration in the expected form.

Responsibilities:
- Declare the expected structure of configuration objects consumed by the adapter code.
- Ensure type safety for configuration values passed through the office adapter boundaries.
- Serve as documentation for what configuration the adapter expects, enabling consistent usage across the module.

---



### Row

![Type: Abstract](https://img.shields.io/badge/Type-Abstract-purple)

#### Description

Row is a TypeScript interface that defines the shape and contract for a single row representation used by the office adapter layer.

Within web-v2/server/office/adapters.ts, Row provides the typed interface that other adapters and utilities rely on to exchange and manipulate row-level data. It anchors the module's row-related APIs by defining the expected shape of row objects used throughout the file.

Responsibilities:
- Declare the expected structure (properties and types) for a row used by the adapters in this module.
- Serve as a compile-time contract to ensure consumers produce and consume row objects consistently.
- Support type safety across functions and components in the office adapter code that manipulate row data.
- Act as the canonical row type for integrations and other parts of the module that need to work with row entities.

---



### object

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

#### Signature

```typescript
def object(value: unknown) -> value is Record<string, unknown>:
```

#### Description

A type guard function that checks whether the given value is an object with string keys and unknown values, i.e., a Record<string, unknown>.

It narrows the input type at runtime so callers can safely treat the value as a plain object when the function returns true.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | ✅ | — |

#### Returns

**Type:** `value is Record<string, unknown>`

—

#### Complexity

Not analyzed

---



### row

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

#### Signature

```typescript
def row(value: unknown) -> Row:
```

#### Description

Converts or wraps an arbitrary input into the module's Row representation.

It accepts any value and normalizes or adapts it into a Row object used by the office adapter layer.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | ✅ | — |

#### Returns

**Type:** `Row`

—

#### Complexity

Not analyzed

---



### officeDependencies

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

#### Signature

```typescript
def officeDependencies(config: Config, takeSlot: ((user: string) => Promise<boolean>) | undefined = undefined, fetcher: typeof fetch = fetch):
```

#### Description

Creates and returns a set of office-related dependency functions using the provided configuration.

It optionally accepts a takeSlot callback to attempt claiming a user slot and a fetcher override for making HTTP requests, and exposes nested helpers named call and rpc for performing those operations.


takeSlot is an optional async callback (user => Promise<boolean>) used to attempt to reserve or claim a slot for a given user; fetcher lets callers substitute a different fetch implementation (useful for testing or environments without the global fetch).

Returns an object of office dependencies (including the nested call and rpc helper functions) configured according to the supplied config and optional callbacks.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | `Config` | ✅ | — |
| `takeSlot` = `undefined` | `((user: string) => Promise<boolean>) | undefined` | ❌ | — |
| `fetcher` = `fetch` | `typeof fetch` | ❌ | — |

#### Complexity

Not analyzed

---



### call

![Type: Async](https://img.shields.io/badge/Type-Async-blue)

#### Signature

```typescript
async def call(path: string, init: RequestInit):
```

#### Description

Performs an asynchronous HTTP call to the given path using the provided RequestInit options.

It is an async helper that issues a request to the specified endpoint and awaits the outcome.


Returns a Promise that resolves with the result of the asynchronous request.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | `string` | ✅ | — |
| `init` | `RequestInit` | ✅ | — |

#### Complexity

Not analyzed

---



### rpc

![Type: Async](https://img.shields.io/badge/Type-Async-blue)

#### Signature

```typescript
async def rpc(name: string, payload: object):
```

#### Description

Performs an asynchronous remote procedure call identified by the given name, sending the provided payload to the target and awaiting a response.

It encapsulates making and awaiting the RPC operation using the specified procedure name and associated data.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ✅ | — |
| `payload` | `object` | ✅ | — |

#### Complexity

Not analyzed

---



---

## Navigation

**↑ Parent Directory:** [Go up](./README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*

<!-- METADATA: {"source_path": "web-v2/src/office/office-gateway.ts", "source_sha": "62505363ebec1d52467a31a8f4afcdc214d34b33", "extraction_quality": "structural", "model": "gpt-5-mini", "generated_at": "2026-10-31T02:49:20Z", "doc_type": "file"} -->
<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "web-v2/src/office/office-gateway.ts",
  "source_hash": "80551a4ac291c4820215df0403d92abf21d69de1f45a3e6f639e1a0e4bc02dd7",
  "last_updated": "2026-10-31T02:49:12.351912+00:00",
  "git_sha": "62505363ebec1d52467a31a8f4afcdc214d34b33",
  "tokens_used": 1494,
  "complexity_score": 1,
  "estimated_review_time_minutes": 5,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../README.md) > [web-v2](../../README.md) > [src](../README.md) > [office](./README.md) > **office-gateway**

---

# office-gateway.ts

> **File:** `web-v2/src/office/office-gateway.ts`

![Complexity: Low](https://img.shields.io/badge/Complexity-Low-green) ![Review Time: 5min](https://img.shields.io/badge/Review_Time-5min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This TypeScript module provides a single exported factory function, createOfficeGateway, for producing an OfficeGateway instance to work with office-related cases. The file imports the OfficeCase and OfficeGateway types from the OfficeWorkspace module and centralizes the construction or provisioning of an OfficeGateway that will be used elsewhere in the codebase to interact with office cases and workspace concerns.

The module is focused and narrowly scoped: it does not declare classes or additional helper functions, but instead exposes the factory function as the module's primary public API. The implementation encapsulates whatever wiring is required to produce an OfficeGateway that is typed according to the OfficeWorkspace definitions.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| `./OfficeWorkspace` | import type {OfficeCase,OfficeGateway} from './OfficeWorkspace' |

## 📁 Directory

This file is part of the **office** directory. View the [directory index](./README.md) to see all files in this module.

## Architecture Notes

- Imports TypeScript types (import type) rather than runtime values
- Module exposes a single top-level factory function
- No classes or methods are declared in this file

## Maintenance Notes

- Provide a factory function named createOfficeGateway to obtain an OfficeGateway instance.
- Reference the OfficeCase and OfficeGateway types from the OfficeWorkspace module to ensure correct typing.
- Encapsulate the creation or provisioning logic for an OfficeGateway so callers need only invoke the factory.


---

## Functions and Classes


### createOfficeGateway

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

#### Signature

```typescript
def createOfficeGateway(getAccessToken: TokenProvider, fetcher: typeof fetch = fetch) -> OfficeGateway:
```

#### Description

Constructs and returns an OfficeGateway object that performs authenticated HTTP calls to the office API.

The created gateway uses the provided TokenProvider to obtain access tokens and the supplied fetch implementation to perform network requests, with a nested helper function call used for making those requests.


getAccessToken is a TokenProvider used to retrieve access tokens for authenticated requests; fetcher is an optional fetch implementation (defaults to the global fetch) that the gateway will use to make HTTP calls.

An OfficeGateway instance that exposes methods for interacting with the office API using authenticated fetch calls.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `getAccessToken` | `TokenProvider` | ✅ | — |
| `fetcher` = `fetch` | `typeof fetch` | ❌ | — |

#### Returns

**Type:** `OfficeGateway`

An OfficeGateway instance that exposes methods for interacting with the office API using authenticated fetch calls.

#### Complexity

Not analyzed

---



### call

![Type: Async](https://img.shields.io/badge/Type-Async-blue)

#### Signature

```typescript
async def call(method: 'GET'|'POST', path: string, payload: unknown = undefined) -> Promise<unknown>:
```

#### Description

Performs an asynchronous operation identified by an HTTP-like method and a resource path, optionally including a payload.

It returns the eventual result of that operation as a promise.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `method` | `'GET'|'POST'` | ✅ | — |
| `path` | `string` | ✅ | — |
| `payload` = `undefined` | `unknown` | ❌ | — |

#### Returns

**Type:** `Promise<unknown>`

—

#### Complexity

Not analyzed

---



---

## Navigation

**↑ Parent Directory:** [Go up](./README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*

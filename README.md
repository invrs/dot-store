# dot-store

Easy to use store and event emitter — async, immutable, self-documenting, highly extensible

![pale blue dot](https://qph.fs.quoracdn.net/main-qimg-347d2c178e6bf511ee5b91e8276c79fa)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Using the store](#using-the-store)
  - [Set values (immutably)](#set-values-immutably)
  - [Get values](#get-values)
  - [Subscribe to changes](#subscribe-to-changes)
- [Store operations](#store-operations)
- [Store subscribers](#store-subscribers)
  - [Subscriber options](#subscriber-options)
  - [Dynamic subscribers](#dynamic-subscribers)
  - [Check for changes](#check-for-changes)
  - [Unsubscribe](#unsubscribe)
- [Custom operations](#custom-operations)
- [Extensions](#extensions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm install --save dot-store
```

## Using the store

```js
import Store from "dot-store"
const store = new Store()
```

### Set values (immutably)

```js
await store.set("users.bob.admin", true)
```

### Get values

```js
store.get("users.bob.admin") // true
store.get() // { users: { bob: { admin: true } } }
```

### Subscribe to changes

This subscriber responds to any change within `users.bob`:

```js
store.on("users.bob", async () => {
  console.log("bob changed")
})
```

## Store operations

| Operation             | Async | Description                           |
| :-------------------- | :---- | :------------------------------------ |
| `get(props)`          | no    | Read prop value                       |
| `delete(props)`       | yes   | Delete prop value                     |
| `merge(props, value)` | yes   | Merge prop value with array or object |
| `set(props, value)`   | yes   | Set prop value                        |
| `time(props)`         | yes   | Set prop value to current timestamp   |
| `toggle(props)`       | yes   | Toggle boolean prop value             |

## Store subscribers

Store operation calls only resolve after all of its subscribers resolve.

| Subscriber                    | Timing                                                                       |
| :---------------------------- | :--------------------------------------------------------------------------- |
| `on(event, prop, fn)`         | Subscribe to prop value change                                               |
| `once(event, prop, fn)`       | Subscribe to a single prop value change                                      |
| `onceExists(event, prop, fn)` | Subscribe to a single prop value change and immediately emit if value exists |

The `event` parameter can be `"beforeUpdate"`, `"afterUpdate"`, or a [custom operation](#custom-operations).

When omitted, the `event` parameter defaults to `"afterUpdate"`.

### Subscriber options

Subscribers receive an options argument with lots of useful stuff:

```js
store.on("users.bob", async options => {
  // see example option values below
})
await store.set("users.bob.admin", true)
```

The `options` in the above subscriber would contain the following values:

| Argument               | Example value                         | Description               |
| :--------------------- | :------------------------------------ | :------------------------ |
| `changed.props`        | `"users.bob.admin"`                   | Changed value props       |
| `changed.propKeys`     | `["users", "bob", "admin"]`           | Changed value prop keys   |
| `changed.value`        | `true`                                | Changed value             |
| `changed.prevValue`    | `undefined`                           | Previous changed value    |
| `subscriber.props`     | `"users.bob"`                         | Subscriber props          |
| `subscriber.propKeys`  | `["users", "bob"]`                    | Subscriber props array    |
| `subscriber.prevValue` | `undefined`                           | Previous subscriber value |
| `subscriber.value`     | `{ admin: true }`                     | Subscriber value          |
| `eventTiming`          | `"after"`                             | Event timing              |
| `op`                   | `"set"`                               | Operation string          |
| `prevState`            | `{}`                                  | Previous state            |
| `state`                | `{ users: { bob: { admin: true } } }` | Current state             |
| `store`                | `<DotStore>`                          | Store instance            |
| `valueChanged(props)`  | `<Function>`                          | Prop value change test    |

### Dynamic subscribers

Use curly braces around a prop key to capture its value:

```js
store.on("users.{userId}", async ({ userId }) => {
  userId // "bob", then "ted"
})

await store.set("users.bob.admin", true)
await store.set("users.ted.admin", true)
```

### Check for changes

The `valueChanged` function tests if a prop value changed.

The return value of `valueChanged` is truthy and doubles as a way to retrieve prop keys:

```js
store.on("users", async ({ valueChanged }) => {
  // ✓ Value did change
  valueChanged("users.{userId}.{attr}") // { userId: "bob", attr: "admin" }
  valueChanged("users.bob.admin") // {}
  valueChanged("users.bob") // {}
  valueChanged("users") // {}

  // ⃠ Value didn't change
  valueChanged("users.ted.{attr}") // false
  valueChanged("users.ted") // false
})

await store.set("users.bob.admin", true)
```

### Unsubscribe

```js
const off = store.on("users.bob", async () => {})
off()
```

## Custom operations

Custom operations do not modify the store. They allow you to leverage store eventing to run your own logic.

After initializing the store, add a custom operation:

```js
const store = new Store()
store.op("fetch")
```

Subscribe to the custom event:

```js
store.on("afterFetch", "users", async function({ value }) {
  value // { admin: "true" }
})

await store.fetch("users", { admin: "true" })
```

## Extensions

| Package                                                                                                 | Description                |
| :------------------------------------------------------------------------------------------------------ | :------------------------- |
| [`dot-store-analyze`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-analyze#readme) | Document store operations  |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access              |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access          |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration          |

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
  - [Check if prop value changed](#check-if-prop-value-changed)
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

Pass an object to the `Store` constructor to set a default state.

### Set values (immutably)

```js
await store.set("users.bob.admin", true)
```

### Get values

```js
store.get("users.bob.admin") // true
store.get() // {users: {bob: {admin: true}}}
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

| Subscriber                     | Timing                                                                       |
| :----------------------------- | :--------------------------------------------------------------------------- |
| `on(event, props, fn)`         | Subscribe to prop value change                                               |
| `once(event, props, fn)`       | Subscribe to a single prop value change                                      |
| `onceExists(event, props, fn)` | Subscribe to a single prop value change and immediately emit if value exists |

The `event` parameter can be `"beforeUpdate"`, `"afterUpdate"`, or a [custom operation](#custom-operations).

When omitted, the `event` parameter defaults to `"afterUpdate"`.

### Subscriber options

Subscribers receive an options argument with lots of useful stuff:

```js
store.on(
  "users.bob",
  async ({
    change,
    event,
    prevState,
    state,
    store,
    subscriber,
  }) => {
    // see example values below
  }
)

await store.set("users.bob.admin", true)
```

| Argument               | Example value                   | Description             |
| :--------------------- | :------------------------------ | :---------------------- |
| `change.prevValue`     | `undefined`                     | Pre-op change value     |
| `change.props`         | `"users.bob.admin"`             | Change props            |
| `change.propKeys`      | `["users", "bob", "admin"]`     | Change prop keys        |
| `change.test(props)`   | `<Function>`                    | Test for change @ prop  |
| `change.value`         | `true`                          | Change value            |
| `event.prep`           | `"after"`                       | Event preposition       |
| `event.op`             | `"set"`                         | Event operation         |
| `prevState`            | `{}`                            | Pre-op state            |
| `state`                | `{users: {bob: {admin: true}}}` | Current state           |
| `store`                | `<DotStore>`                    | Store instance          |
| `subscriber.props`     | `"users.bob"`                   | Subscriber props        |
| `subscriber.propKeys`  | `["users", "bob"]`              | Subscriber prop keys    |
| `subscriber.value`     | `{admin: true}`                 | Subscriber value        |
| `subscriber.prevValue` | `undefined`                     | Pre-op subscriber value |

### Dynamic subscribers

Use curly braces around a prop key to capture its value:

```js
store.on("users.{userId}", async ({ userId }) => {
  userId // "bob", then "ted"
})

await store.set("users.bob.admin", true)
await store.set("users.ted.admin", true)
```

### Check if prop value changed

The `change.test(props)` function tests if a prop value changed.

The return value is truthy and doubles as a way to retrieve prop keys:

```js
store.on("users", async ({ change }) => {
  // ✓ Value did change
  change.test("users.{userId}.{attr}") // { userId: "bob", attr: "admin" }
  change.test("users.bob.admin") // {}
  change.test("users.bob") // {}
  change.test("users") // {}

  // ⃠ Value didn't change
  change.test("users.ted.{attr}") // false
  change.test("users.ted") // false
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
store.on("fetch", "users", async function({ value }) {
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

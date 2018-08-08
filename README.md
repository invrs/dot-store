# dot-store

Easy to use store and event emitter — async, immutable, self-documenting, highly extensible

![pale blue dot](https://qph.fs.quoracdn.net/main-qimg-347d2c178e6bf511ee5b91e8276c79fa)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Using the store](#using-the-store)
  - [Set values (immutably)](#set-values-immutably)
  - [Get values](#get-values)
- [Store operations](#store-operations)
  - [Asynchronous?](#asynchronous)
  - [Custom operations (events)](#custom-operations-events)
- [Store subscribers](#store-subscribers)
  - [Subscribe to changes](#subscribe-to-changes)
  - [Dynamic subscriptions](#dynamic-subscriptions)
  - [Subscription arguments](#subscription-arguments)
  - [Unsubscribe](#unsubscribe)
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

## Store operations

| Operation | Async | Description                         |
| :-------- | :---- | :---------------------------------- |
| `get`     | no    | Read property                       |
| `delete`  | yes   | Delete property                     |
| `merge`   | yes   | Merge property with array or object |
| `set`     | yes   | Set property                        |
| `time`    | yes   | Set property to current timestamp   |
| `toggle`  | yes   | Toggle boolean property             |

### Asynchronous?

What does it mean when we say `dot-store` is async?

Store operations return a promise that only resolves once all subscriptions finish. Since subscriptions can be asynchronous, you now have an extensible asynchronous chain. Add subscribers before or after any operation or event without changing any implementation code.

### Custom operations (events)

After initializing the store, you may add custom operations:

```js
store.op("fetch")
```

Now use `fetch` the same as you would the `set` operation:

```js
store.on("fetch", "users", async function({ value }) {
  value // { admin: "true" }
})

await store.fetch("users", { admin: "true" })
```

Custom operations do not modify the store (unless you do so from the subscription).

## Store subscribers

| Subscriber | Timing                                                |
| :----------- | :---------------------------------------------------------- |
| `on`         | Emits every property change                      |
| `once`       | Emits once after a property change                       |
| `onceExists` | Emits once after a property change or if the property already exists |

### Subscribe to changes

```js
store.on("users.bob", async () => {
  console.log("bob's changed")
})
```

### Dynamic subscriptions

Use curly brace notation to wildcard match on a property:

```js
store.on("users.{login}", async ({ login }) => {
  login // "bob"
})

await store.set("users.bob.admin", true)
```

### Subscription arguments

Subscriptions receive an options argument with lots of useful stuff:

| Argument | Description                                   |
| :---------------- | :-------------------------------------------- |
| `changed`         | Function to check which props changed            |
| `event`           | Event tense (`before` or `after`)       |
| `listenProp`      | Subscription props string                     |
| `listenProps`     | Subscription props array                      |
| `listenPrev`      | Subscription props value (before operation)   |
| `listenValue`     | Subscription props value (after operation)    |
| `op`              | Operation string (`get`, `delete`, etc)       |
| `prop`            | Changed props |
| `props`           | Changed props array                        |
| `value`           | Changed props value                        |
| `prev`            | Previous changed property value               |
| `prevState`       | Previous state snapshot                       |
| `state`           | State snapshot                                |
| `store`           | Store instance                                |

### Unsubscribe

```js
const off = store.on("users.bob", async () => {})
off()
```

## Extensions

| Package                                                                                                 | Description                        |
| :------------------------------------------------------------------------------------------------------ | :--------------------------------- |
| [`dot-store-analyze`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-analyze#readme) | Document store operations          |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access                      |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access                  |
| [`dot-store-iframe`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-iframe#readme)       | Iframe & DFP access (browser only) |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API         |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration                  |

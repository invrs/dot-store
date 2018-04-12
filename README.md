# dot-store

Like Redux, but easy.

![pale blue dot](https://qph.fs.quoracdn.net/main-qimg-347d2c178e6bf511ee5b91e8276c79fa)

## Install

```bash
npm install --save dot-store
```

## Basics

Create an in-memory store:

```js
import Store from "dot-store"
const store = new Store()
```

Operate on state with ["dot props"](https://github.com/debitoor/dot-prop-immutable#readme):

```js
await store.set("users.employees", { bob: {} })
await store.merge("users.employees.bob", { name: "Bob" })
await store.toggle("users.employees.bob.admin")
await store.delete("users.employees.bob")
```

Read state:

```js
await store.get("users.employees.bob")
// or
store.getSync("users.employees.bob")
// or
store.state.users.employees.bob
```

## Callbacks

Callbacks may be asynchronous and execute sequentially before and after each operation.

| Operation | Callbacks                                                    |
| --------- | ------------------------------------------------------------ |
| `get`     | `beforeGet`, `afterGet`                                      |
| `delete`  | `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete` |
| `merge`   | `beforeUpdate`, `afterUpdate`, `beforeMerge`, `afterMerge`   |
| `set`     | `beforeUpdate`, `afterUpdate`, `beforeSet`, `afterSet`       |
| `toggle`  | `beforeUpdate`, `afterUpdate`, `beforeToggle`, `afterToggle` |

```js
// Subscribe to all updates
store.subscribe(async ({ op, prop, state, value }) => {})

// Subscribe to specific operations
store.subscribe(
  "beforeGet",
  async ({ op, prop, state }) => {}
)
```

| Callback argument | Description                              |
| ----------------- | ---------------------------------------- |
| `op`              | The operation (`get`, `delete`, etc)     |
| `prop`            | The dot-prop locator                     |
| `state`           | State snapshot                           |
| `value`           | Third argument to operation (if present) |

## Using with React

Install `dot-store-react`:

```bash
npm install --save dot-store-react
```

Add `StoreProvider` to your component tree:

```js
import Store from "dot-store"
import { StoreProvider } from "dot-store-react"

export default class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.store = new Store({ counter: 0 })
  }
  render() {
    return (
      <StoreProvider store={this.store}>
        {this.props.children}
      </StoreProvider>
    )
  }
)
```

Read and write to the store:

```js
import { withStore } from "dot-store-react"

class Page extends React.Component {
  render() {
    let { state, store } = this.props
    store.set("counter", state.counter + 1)
  }
}

export default withStore(Page)
```

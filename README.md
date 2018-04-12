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

Mutate state with ["dot props"](https://github.com/debitoor/dot-prop-immutable#readme):

```js
store.set("users", { employees: {} })
store.merge("users.employees", { john: {} })
store.toggle("users.employees.john.admin")
```

Read state:

```js
store.get("users.employees.john")
// or
store.state.users.employees.john
```

And subscribe to changes:

```js
store.subscribe((props, state) => {
  if (props.match(/^users\./)) {
    // do something if users.* is mutated
  }
})
```

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
    let { store } = this.props
    let { set, state } = store

    set("counter", state.counter + 1)
  }
}

export default withStore(Page)
```

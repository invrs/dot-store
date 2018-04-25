# dot-store-react

React integration for [dot-store](https://github.com/invrs/dot-store).

## Install

```bash
npm install --save dot-store-react
```

## Provider

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

## Component

Read and write to the store:

```js
import { withStore } from "dot-store-react"

class Page extends React.Component {
  shouldComponentUpdate({ changes }) {
    return changes.some(c => c == "counter")
  }

  render() {
    let { state, store } = this.props
    store.set("counter", state.counter + 1)
    return state.counter
  }
}

export default withStore(Page)
```

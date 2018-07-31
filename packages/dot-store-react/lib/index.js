import React from "react"

const { Provider, Consumer } = React.createContext()

export const withStore = Component =>
  class extends React.Component {
    static async getInitialProps(context) {
      if (Component.getInitialProps) {
        return await Component.getInitialProps(context)
      }
    }

    changed(fns) {
      return (...matchers) =>
        fns.reduce((memo, changed) => {
          let out = changed(...matchers)

          if (out) {
            return { ...(memo || {}), ...out }
          } else {
            return memo
          }
        }, false)
    }

    render() {
      return (
        <Consumer>
          {([changes, changeFns, store]) => (
            <Component
              {...this.props}
              changes={changes}
              changed={this.changed(changeFns)}
              state={store.state}
              store={store}
            />
          )}
        </Consumer>
      )
    }
  }

export const withStoreProvider = createStore => Component =>
  class extends React.Component {
    static displayName = `withStoreProvider(${
      Component.displayName
    })`

    static async getInitialProps(context) {
      const store = createStore()

      let props = {}

      if (Component.getInitialProps) {
        props = await Component.getInitialProps({
          ...context,
          store,
        })
      }

      return { ...props, storeState: store.state }
    }

    constructor(props) {
      super(props)
      this.store = createStore({ state: props.storeState })
    }

    render() {
      return (
        <StoreProvider store={this.store}>
          <Component {...this.props} />
        </StoreProvider>
      )
    }
  }

export class StoreProvider extends React.Component {
  constructor(props) {
    super(props)
    this.changes = []
    this.changeFns = []
    this.store = props.store
    this.onUpdate = this.onUpdate.bind(this)
  }

  onUpdate({ changed, prop }) {
    this.changes = this.changes.concat([prop])
    this.changeFns = this.changeFns.concat([changed])
    this.forceUpdate()
  }

  componentDidMount() {
    this.store.on(this.onUpdate)
  }

  componentWillUnmount() {
    this.store.off(this.onUpdate)
  }

  render() {
    const changes = this.changes.concat([])
    const changeFns = this.changeFns.concat([])

    this.changes = []
    this.changeFns = []

    return (
      <Provider value={[changes, changeFns, this.store]}>
        {this.props.children}
      </Provider>
    )
  }
}

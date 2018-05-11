import React from "react"
import reactContext from "create-react-context"

const StoreContext = reactContext()

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
        <StoreContext.Consumer>
          {([changes, changeFns, store]) => (
            <Component
              {...this.props}
              changes={changes}
              changed={this.changed(changeFns)}
              state={store.state}
              store={store}
            />
          )}
        </StoreContext.Consumer>
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
      <StoreContext.Provider
        value={[changes, changeFns, this.store]}
      >
        {this.props.children}
      </StoreContext.Provider>
    )
  }
}

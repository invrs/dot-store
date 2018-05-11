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

    detectChanges(fns) {
      return (...matchers) =>
        fns.reduce((memo, detectChange) => {
          let out = detectChange(...matchers)

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
              detectChanges={this.detectChanges(changeFns)}
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

  onUpdate({ detectChange, prop }) {
    this.changes = this.changes.concat([prop])
    this.changeFns = this.changeFns.concat([detectChange])
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

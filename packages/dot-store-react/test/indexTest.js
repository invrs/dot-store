import React from "react"
import { mount } from "enzyme"

import { StoreProvider, withStore } from "../dist"
import Store from "../../dot-store-core/dist"

const Layout = class extends React.Component {
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
}

test("props", async () => {
  let props

  const Component = withStore(
    class extends React.Component {
      render() {
        props = this.props
        return null
      }
    }
  )

  mount(
    <Layout>
      <Component />
    </Layout>
  )

  expect(props.changes).toBeInstanceOf(Array)
  expect(props.store).toBeInstanceOf(Store)

  expect(props.changes).toEqual([])
  expect(props.store.state).toEqual({ counter: 0 })

  await props.store.set("counter", 1)

  expect(props.changes).toEqual(["counter"])
  expect(props.store.state).toEqual({ counter: 1 })

  mount(
    <Layout>
      <Component />
    </Layout>
  )

  expect(props.changes).toEqual([])
  expect(props.store.state).toEqual({ counter: 0 })
})

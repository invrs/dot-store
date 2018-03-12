import React from "react"
import { mount } from "enzyme"

import { StoreProvider, withStore } from "../dist"
import Store from "../../../dist"

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
    <StoreProvider>
      <Component />
    </StoreProvider>
  )

  expect(props.changes).toBeInstanceOf(Array)
  expect(props.store).toBeInstanceOf(Store)

  expect(props.changes).toEqual([])
  expect(props.store.state).toEqual({})

  await props.store.set("test", {})

  expect(props.changes).toEqual(["test"])
  expect(props.store.state).toEqual({ test: {} })

  mount(
    <StoreProvider>
      <Component />
    </StoreProvider>
  )

  expect(props.changes).toEqual([])
  expect(props.store.state).toEqual({})
})

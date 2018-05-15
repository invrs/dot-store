# dot-store-iframe

Iframe controller integration for [dot-store](https://github.com/invrs/dot-store).

![ads](https://media1.giphy.com/media/d2YZzTQvyoNYf9YI/giphy.gif)

## Install

```bash
npm install --save dot-store-iframe
```

## Usage

### Create the store

```js
import DotStore from "dot-store"
import withIframe from "dot-store-iframe"

const store = new DotStore()
export default withIframe(store)
```

### Build an ad slot

```js
import iframeStore from "./iframeStore"

iframeStore.set("dfp.viewportMaps", [
  [1200, 800],
  [1024, 768],
  [768, 1024],
  [732, 412],
  [568, 320],
  [360, 640],
  [320, 568],
  [0, 0],
])

iframeStore.set("dfp.units.top1", {
  sizes: [[300, 50], [300, 100], [728, 90]],
  viewportSizes: [
    [[300, 100], [728, 90]],
    [[300, 100], [728, 90]],
    [[300, 100], [728, 90]],
    [[300, 50], [300, 100], [728, 90]],
    [[300, 50], [300, 100]],
    [[300, 50], [300, 100]],
    [[300, 50], [300, 100]],
    [[300, 50], [300, 100]],
  ],
})

iframeStore.set("iframes.div1", {
  active: true,
  divId: "div1",
  dfp: {
    oop: false,
    path: "/01234567/unit/path",
    unitId: "top1",
  },
})
```

### Monitor changes

```js
iframeStore.on("dfp.loaded", options => {
  // dfp loaded
})

iframeStore.on("iframes.div1.slot", options => {
  // slot created
})

iframeStore.on("iframes.div1.loaded", options => {
  // slot loaded
})

iframeStore.on("iframes.div1.rendered", options => {
  // slot rendered
})
```

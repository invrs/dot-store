# dot-store-cookie

Cookie integration for [dot-store](https://github.com/invrs/dot-store).

![cookie](https://78.media.tumblr.com/2a04af2fa0a47f08392de7bcba37391c/tumblr_mtz8xrB2p21sk3374o1_500.gif)

## Install

```bash
npm install --save dot-store-cookie
```

## Create the store

```js
import DotStore from "dot-store"
import withCookie from "dot-store-cookie"

const store = withCookie(new DotStore())
```

## Fetch cookies

```js
await store.fetch("cookies.mycookie")
```

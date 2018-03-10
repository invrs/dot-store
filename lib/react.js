// import reactContext from "create-react-context"
// const StoreContext = createReactContext()

// export const withStore = Component =>
//   class extends React.Component {
//     render() {
//       return (
//         <StoreContext.Consumer>
//           {([ changes, store ]) => (
//             <Component changes={changes} store={store} />
//           )}
//         </StoreContext.Consumer>
//       )
//     }
//   }

// export class StoreProvider extends React.Component {
//   constructor(props) {
//     super(props)
//     this.changes = []
//     this.store = store()
//     this.subscribe()
//   }

//   subscribe() {
//     this.state.store.subscribe((store, change) {
//       this.changes = this.changes.concat([ change ])
//       this.store = store
//       this.forceUpdate()
//     })
//   }

//   render(props) {
//     let changes = this.changes.concat([])
//     this.changes = []

//     return (
//       <StoreContext.Provider value={[changes, this.store]}>
//         {props.children}
//       </StoreContext.Provider>
//     )
//   }
// }

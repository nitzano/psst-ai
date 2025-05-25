import useStore from './store.js'

console.log('Initial count:', useStore.getState().count)

// Subscribe to store changes
useStore.subscribe(
  state => state.count,
  count => console.log('Count changed to:', count)
)

// Update the store
useStore.getState().increment()
useStore.getState().increment()
useStore.getState().decrement()

console.log('Final count:', useStore.getState().count)

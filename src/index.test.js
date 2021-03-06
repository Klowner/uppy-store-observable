const ObservableStore = require('./index')

describe('ObservableStore', () => {
  it('can be created with or without new', () => {
    let store = ObservableStore()
    expect(typeof store).toBe('object')
    store = new ObservableStore()
    expect(typeof store).toBe('object')
  })

  it('merges in state using `setState`', () => {
    const store = ObservableStore()
    expect(store.getState()).toEqual({})

    store.setState({
      a: 1,
      b: 2
    })
    expect(store.getState()).toEqual({ a: 1, b: 2 })
  })

  it('notifies subscriptions when state changes', () => {
    let expected = []
    let calls = 0
    function listener (prevState, nextState, patch) {
      calls++
      expect([prevState, nextState, patch]).toEqual(expected)
    }

    const store = ObservableStore()
    store.subscribe(listener)

    expected = [{}, { a: 1, b: 2 }, { a: 1, b: 2 }]
    store.setState({
      a: 1,
      b: 2
    })

    expected = [{ a: 1, b: 2 }, { a: 1, b: 3 }, { b: 3 }]
    store.setState({ b: 3 })

    expect(calls).toBe(2)
  })

  it('can expose state subqueries as observables', () => {
    let expected = {}
    let calls = 0

    function listener (state) {
      calls++
      expect(state).toEqual(expected)
    }

    function unrelatedListener (state) {
      // TODO - this emits {} before it's set in the state during the first setState :[
      // expect(state).toEqual('changes')
    }

    const store = ObservableStore()
    const fileResponse$ = store.asObservable('files.response')
    const sub = fileResponse$.subscribe(listener)
    const unrelatedResponse$ = store.asObservable('unrelated')
    const sub2 = unrelatedResponse$.subscribe(unrelatedListener)

    expected = [1, 2, 3]
    store.setState({ files: { response: [1, 2, 3] } })

    // shouldn't call with unrelated path update
    expect(calls).toBe(1)
    store.setState({ unrelated: {} })
    expect(calls).toBe(1)

    expected = ['hello']
    store.setState({ files: { response: ['hello'] } })

    expected = {}
    store.setState({ files: null })

    expect(calls).toBe(3)

    sub.unsubscribe()
    sub2.unsubscribe()
    return new Promise(resolve => setTimeout(resolve, 0)) // rxjs throws error on next tick
  })
})

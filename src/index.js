const { Subject, ReplaySubject } = require('rxjs')
const { distinctUntilChanged, multicast, map, shareReplay, concatMap, take } = require('rxjs/operators')

class ObservableStore {
  static VERSION = require('../package.json').version

  constructor (initialState = {}) {
    this.change$ = new Subject()
    this.state$ = new ReplaySubject(1)

    this.mergedChange$ = this.change$.pipe(
      concatMap(change => this.state$.pipe(
        take(1),
        map(currentState => {
          const newState = { ...currentState, ...change }
          return [currentState, newState, change]
        })
      )),
      shareReplay(1)
    )

    this.currentState$ = this.mergedChange$.pipe(
      map(([prevState, newState, change]) => newState),
      shareReplay(1)
    )

    this.applyChange$ = this.currentState$.pipe(
      shareReplay(1),
      multicast(this.state$)
    )

    this.state$.next({})
    this.applyChange$.connect()
  }

  getState () {
    let state
    this.state$.pipe(
      take(1)
    ).subscribe(_state => {
      state = _state
    })
    return state
  }

  setState (patch) {
    this.change$.next(patch)
  }

  getState$ () {
    return this.newState$.asObservable()
  }

  asObservable (selector = null) {
    let state$ = this.currentState$
    if (selector) {
      state$ = state$.pipe(this._createFilter(selector))
    }
    return state$.asObservable()
  }

  subscribe (listener) {
    return this.mergedChange$.subscribe(params => {
      listener(...params)
    })
  }

  _createFilter (selector) {
    const empty = {}
    const selectorParts = selector.split('.')
    const extract = input =>
      selectorParts
        .reduce((acc, cur) => acc[cur] || empty, input)

    return input$ => input$.pipe(
      map(input => extract(input)),
      distinctUntilChanged()
    )
  }
}

module.exports = function observableStore (initialState) {
  return new ObservableStore()
}

const { Subject, ReplaySubject } = require('rxjs')
const { share, multicast, map, shareReplay, concatMap, take } = require('rxjs/operators')

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
      share()
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
    const sub = this.state$.pipe(
      take(1)
    ).subscribe(_state => {
      state = _state
    })
    sub.unsubscribe()
    return state
  }

  setState (patch) {
    this.change$.next(patch)
  }

  getState$ () {
    return this.newState$.asObservable()
  }

  asObservable () {
    return this.currentState$.asObservable()
  }

  subscribe (listener) {
    return this.mergedChange$.subscribe(params => {
      listener(...params)
    })
  }
}

module.exports = function observableStore (initialState) {
  return new ObservableStore()
}

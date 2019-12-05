const { of, merge, Subject } = require('rxjs')
const { map, shareReplay, switchMap, take } = require('rxjs/operators')

class ObservableStore {
  static VERSION = require('../package.json').version

  constructor () {
    this.change$ = new Subject()

    this.buildChange$ = this.change$.pipe(
      switchMap(patch => this.state$.pipe(
        map(currentState => {
          const newState = {
            ...currentState,
            ...patch
          }
          return [currentState, newState, patch]
        }),
        take(1)
      ))
    )

    this.mergeChange$ = this.buildChange$.pipe(
      map(([currentState, newState, patch]) => newState)
    )

    this.state$ = merge(
      of({}),
      this.mergeChange$
    ).pipe(
      shareReplay(1)
    )
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
    return this.state$.asObservable()
  }

  subscribe (listener) {
    return this.buildChange$.subscribe(([currentState, newState, patch]) =>
      listener(currentState, newState, patch)
    )
  }
}

module.exports = function observableStore () {
  return new ObservableStore()
}

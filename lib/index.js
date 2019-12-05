function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _require = require('rxjs'),
    of = _require.of,
    merge = _require.merge,
    Subject = _require.Subject;

var _require2 = require('rxjs/operators'),
    map = _require2.map,
    shareReplay = _require2.shareReplay,
    switchMap = _require2.switchMap,
    take = _require2.take;

var ObservableStore =
/*#__PURE__*/
function () {
  function ObservableStore() {
    var _this = this;

    this.change$ = new Subject();
    this.buildChange$ = this.change$.pipe(switchMap(function (patch) {
      return _this.state$.pipe(map(function (currentState) {
        var newState = _extends({}, currentState, {}, patch);

        return [currentState, newState, patch];
      }), take(1));
    }));
    this.mergeChange$ = this.buildChange$.pipe(map(function (_ref) {
      var currentState = _ref[0],
          newState = _ref[1],
          patch = _ref[2];
      return newState;
    }));
    this.state$ = merge(of({}), this.mergeChange$).pipe(shareReplay(1));
  }

  var _proto = ObservableStore.prototype;

  _proto.getState = function getState() {
    var state;
    var sub = this.state$.pipe(take(1)).subscribe(function (_state) {
      state = _state;
    });
    sub.unsubscribe();
    return state;
  };

  _proto.setState = function setState(patch) {
    this.change$.next(patch);
  };

  _proto.getState$ = function getState$() {
    return this.state$.asObservable();
  };

  _proto.subscribe = function subscribe(listener) {
    return this.buildChange$.subscribe(function (_ref2) {
      var currentState = _ref2[0],
          newState = _ref2[1],
          patch = _ref2[2];
      return listener(currentState, newState, patch);
    });
  };

  return ObservableStore;
}();

ObservableStore.VERSION = require('../package.json').version;

module.exports = function observableStore() {
  return new ObservableStore();
};

//# sourceMappingURL=index.js.map
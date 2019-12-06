function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _require = require('rxjs'),
    Subject = _require.Subject,
    ReplaySubject = _require.ReplaySubject;

var _require2 = require('rxjs/operators'),
    distinctUntilChanged = _require2.distinctUntilChanged,
    multicast = _require2.multicast,
    map = _require2.map,
    shareReplay = _require2.shareReplay,
    concatMap = _require2.concatMap,
    take = _require2.take;

var ObservableStore =
/*#__PURE__*/
function () {
  function ObservableStore(initialState) {
    var _this = this;

    if (initialState === void 0) {
      initialState = {};
    }

    this.change$ = new Subject();
    this.state$ = new ReplaySubject(1);
    this.mergedChange$ = this.change$.pipe(concatMap(function (change) {
      return _this.state$.pipe(take(1), map(function (currentState) {
        var newState = _extends({}, currentState, {}, change);

        return [currentState, newState, change];
      }));
    }), shareReplay(1));
    this.currentState$ = this.mergedChange$.pipe(map(function (_ref) {
      var prevState = _ref[0],
          newState = _ref[1],
          change = _ref[2];
      return newState;
    }), shareReplay(1));
    this.applyChange$ = this.currentState$.pipe(shareReplay(1), multicast(this.state$));
    this.state$.next({});
    this.applyChange$.connect();
  }

  var _proto = ObservableStore.prototype;

  _proto.getState = function getState() {
    var state;
    this.state$.pipe(take(1)).subscribe(function (_state) {
      state = _state;
    });
    return state;
  };

  _proto.setState = function setState(patch) {
    this.change$.next(patch);
  };

  _proto.getState$ = function getState$() {
    return this.newState$.asObservable();
  };

  _proto.asObservable = function asObservable(selector) {
    if (selector === void 0) {
      selector = null;
    }

    var state$ = this.currentState$;

    if (selector) {
      state$ = state$.pipe(this._createFilter(selector));
    }

    return state$.asObservable();
  };

  _proto.subscribe = function subscribe(listener) {
    return this.mergedChange$.subscribe(function (params) {
      listener.apply(void 0, params);
    });
  };

  _proto._createFilter = function _createFilter(selector) {
    var empty = {};
    var selectorParts = selector.split('.');

    var extract = function extract(input) {
      return selectorParts.reduce(function (acc, cur) {
        return acc[cur] || empty;
      }, input);
    };

    return function (input$) {
      return input$.pipe(map(function (input) {
        return extract(input);
      }), distinctUntilChanged());
    };
  };

  return ObservableStore;
}();

ObservableStore.VERSION = require('../package.json').version;

module.exports = function observableStore(initialState) {
  return new ObservableStore();
};

//# sourceMappingURL=index.js.map
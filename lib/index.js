function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _require = require('rxjs'),
    Subject = _require.Subject,
    ReplaySubject = _require.ReplaySubject;

var _require2 = require('rxjs/operators'),
    share = _require2.share,
    multicast = _require2.multicast,
    map = _require2.map,
    tap = _require2.tap,
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
      }), tap(function (change) {
        return console.log('CHANGE', change);
      }));
    }), shareReplay(1));
    this.currentState$ = this.mergedChange$.pipe(map(function (_ref) {
      var prevState = _ref[0],
          newState = _ref[1],
          change = _ref[2];
      return newState;
    }), share());
    this.applyChange$ = this.currentState$.pipe(shareReplay(1), multicast(this.state$));
    this.state$.next({});
    this.applyChange$.connect();
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
    return this.newState$.asObservable();
  };

  _proto.asObservable = function asObservable() {
    return this.currentState$.asObservable();
  };

  _proto.subscribe = function subscribe(listener) {
    return this.mergedChange$.subscribe(function (params) {
      listener.apply(void 0, params);
    });
  };

  return ObservableStore;
}();

ObservableStore.VERSION = require('../package.json').version;

var FuckinDumbStore =
/*#__PURE__*/
function () {
  function FuckinDumbStore() {
    this.stort = {};
    this.listeners = [];
  }

  var _proto2 = FuckinDumbStore.prototype;

  _proto2.getState = function getState() {
    return this.stort;
  };

  _proto2.setState = function setState(patch) {
    console.log('SET', patch);

    var oldState = _extends({}, this.stort);

    var newState = _extends({}, oldState, {}, patch);

    this.stort = newState;

    this._publish(oldState, newState, patch);
  };

  _proto2._publish = function _publish() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    console.log('PUBLISH', args);
    this.listeners.forEach(function (listener) {
      return listener.apply(void 0, args);
    });
  };

  _proto2.subscribe = function subscribe(listener) {
    var _this2 = this;

    this.listeners.push(listener);
    return function () {
      _this2.listeners.splice(_this2.listeners.indexOf(listener));
    };
  };

  return FuckinDumbStore;
}();

module.exports = function observableStore(initialState) {
  return new ObservableStore(); // return new FuckinDumbStore()
};

//# sourceMappingURL=index.js.map
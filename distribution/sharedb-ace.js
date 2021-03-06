'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reconnectingWebsocket = require('reconnecting-websocket');

var _reconnectingWebsocket2 = _interopRequireDefault(_reconnectingWebsocket);

var _eventEmitterEs = require('event-emitter-es6');

var _eventEmitterEs2 = _interopRequireDefault(_eventEmitterEs);

var _client = require('sharedb/lib/client');

var _client2 = _interopRequireDefault(_client);

var _sharedbAceBinding = require('./sharedb-ace-binding');

var _sharedbAceBinding2 = _interopRequireDefault(_sharedbAceBinding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @name sharedb-ace.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author Jethro Kuan <jethrokuan95@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function IllegalArgumentException(message) {
  this.message = message;
  this.name = 'IllegalArgumentException';
}

var SharedbAce = function (_EventEmitter) {
  _inherits(SharedbAce, _EventEmitter);

  /**
   * creating an instance connects to sharedb via websockets
   * and initializes the document with no connections
   *
   * Assumes that the document is already initialized
   *
   * The "ready" event is fired once the ShareDB document has been initialized
   *
   * @param {string} id - id of the ShareDB document
   * @param {Object} options - options object containing various
   * required configurations
   * @param {string} options.namespace - namespace of document within
   * ShareDB, to be equal to that on the server
   * @param {string} options.WsUrl - Websocket URL for ShareDB
   * @param {string} options.pluginWsUrl - Websocket URL for extra plugins
   * (different port from options.WsUrl)
   */
  function SharedbAce(id, options) {
    _classCallCheck(this, SharedbAce);

    var _this = _possibleConstructorReturn(this, (SharedbAce.__proto__ || Object.getPrototypeOf(SharedbAce)).call(this));

    _this.id = id;
    if (options.pluginWsUrl !== null) {
      _this.pluginWS = new _reconnectingWebsocket2.default(options.pluginWsUrl);
    }

    if (options.WsUrl === null) {
      throw new IllegalArgumentException('wsUrl not provided.');
    }

    _this.WS = new _reconnectingWebsocket2.default(options.WsUrl);

    var connection = new _client2.default.Connection(_this.WS);
    if (options.namespace === null) {
      throw new IllegalArgumentException('namespace not provided.');
    }
    var namespace = options.namespace;
    var doc = connection.get(namespace, id);

    // Fetches once from the server, and fires events
    // on subsequent document changes

    var docSubscribed = function docSubscribed(err) {
      if (err) throw err;

      if (doc.type === null) {
        _this.emit('noDoc');
      }

      _this.emit('ready');
    };

    doc.subscribe(docSubscribed.bind(doc));

    _this.doc = doc;
    _this.connections = {};
    return _this;
  }

  /**
   * Creates a two-way binding between the ace instance and the document
   *
   * adds the binding to the instance's "connections" property
   *
   * @param {Object} ace - ace editor instance
   * @param {string[]} path - A lens, describing the nesting to the JSON document.
   * It should point to a string.
   * @param {Object[]} plugins - list of plugins to add to this particular
   * ace instance
   */


  _createClass(SharedbAce, [{
    key: 'add',
    value: function add(ace, path, plugins) {
      var sharePath = path || [];
      var binding = new _sharedbAceBinding2.default({
        ace: ace,
        doc: this.doc,
        path: sharePath,
        pluginWS: this.pluginWS,
        id: this.id,
        plugins: plugins
      });
      this.connections[path.join('-')] = binding;
    }
  }]);

  return SharedbAce;
}(_eventEmitterEs2.default);

exports.default = SharedbAce;
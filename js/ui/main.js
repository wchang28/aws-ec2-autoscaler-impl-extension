"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var grid_client_browser_1 = require("grid-client-browser");
var implApi_1 = require("../implApi");
var implApiCore = grid_client_browser_1.GridClient.getSession().AutoScalerImplementationApiCore;
var impl = implApi_1.getImplementation(implApiCore);
var ImplApp = (function (_super) {
    __extends(ImplApp, _super);
    function ImplApp(props) {
        var _this = _super.call(this, props) || this;
        _this.msgClient = null;
        _this.state = { conn_id: null, sub_id: null, setup: null };
        return _this;
    }
    Object.defineProperty(ImplApp.prototype, "Implementation", {
        get: function () { return this.props.implementation; },
        enumerable: true,
        configurable: true
    });
    ImplApp.prototype.componentDidMount = function () {
        var _this = this;
        console.log('componentDidMount()');
        this.Implementation.Setup.toJSON()
            .then(function (setup) {
            _this.setState({ setup: setup });
        }).catch(function (err) {
            console.error('!!! error:' + JSON.stringify(err));
        });
        this.msgClient = this.props.apiCore.$M();
        this.msgClient.on('connect', function (conn_id) {
            console.log('connected to the dispatcher: conn_id=' + conn_id);
            _this.setState({ conn_id: conn_id });
            _this.msgClient.subscribe("/", function (msg) {
                _this.Implementation.Setup.toJSON()
                    .then(function (setup) {
                    _this.setState({ setup: setup });
                }).catch(function (err) {
                    console.error('!!! error:' + JSON.stringify(err));
                });
            }, {})
                .then(function (sub_id) {
                console.log("topic subscription is successful. sub_id=" + sub_id);
                _this.setState({ sub_id: sub_id });
            }).catch(function (err) {
                console.error('!!! subscription error:' + JSON.stringify(err));
                _this.setState({ sub_id: null });
            });
        }).on('error', function (err) {
            console.error('!!! connection error:' + JSON.stringify(err));
            _this.setState({ conn_id: null });
        });
    };
    ImplApp.prototype.componentWillUnmount = function () {
        console.log('componentWillUnmount()');
        this.msgClient.disconnect();
        this.msgClient = null;
    };
    ImplApp.prototype.render = function () {
        return React.createElement("div", null, this.state.setup ? JSON.stringify(this.state.setup, null, 2) : "???");
    };
    return ImplApp;
}(React.Component));
ReactDOM.render(React.createElement(ImplApp, { implementation: impl, apiCore: implApiCore }), document.getElementById('main'));

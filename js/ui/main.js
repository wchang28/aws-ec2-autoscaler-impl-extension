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
    Object.defineProperty(ImplApp.prototype, "Setup", {
        get: function () { return this.state.setup; },
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
    Object.defineProperty(ImplApp.prototype, "CanChangeField", {
        get: function () { return (this.Setup ? true : false); },
        enumerable: true,
        configurable: true
    });
    ImplApp.prototype.getNumericFieldChangeButtonClickHandler = function (fieldLabel, currentValue, fieldIsFloat, setValueProc) {
        var handler = function (e) {
            var s = prompt("New " + fieldLabel + ":", currentValue.toString());
            if (s !== null) {
                s = s.trim();
                if (s) {
                    var value = (fieldIsFloat ? parseFloat(s) : parseInt(s));
                    if (isNaN(value))
                        alert("input is not a valid number");
                    else {
                        var p = setValueProc(value);
                        p.then(function (value) {
                        }).catch(function (err) {
                            console.error('!!! Unable set field auto-scaler: ' + JSON.stringify(err));
                        });
                    }
                }
            }
            e.preventDefault();
        };
        return handler.bind(this);
    };
    ImplApp.prototype.getTextFieldChangeButtonClickHandler = function (fieldLabel, currentValue, setValueProc) {
        var handler = function (e) {
            var s = prompt("New " + fieldLabel + ":", currentValue);
            if (s !== null) {
                s = s.trim();
                if (s) {
                    var p = setValueProc(s);
                    p.then(function (value) {
                    }).catch(function (err) {
                        console.error('!!! Unable set field auto-scaler: ' + JSON.stringify(err));
                    });
                }
            }
            e.preventDefault();
        };
        return handler.bind(this);
    };
    ImplApp.prototype.render = function () {
        var style = { "width": "33%" };
        return (React.createElement("div", { style: style },
            React.createElement("div", { className: "w3-card-4 w3-margin" },
                React.createElement("div", { className: "w3-container w3-blue" },
                    React.createElement("h6", null, "Setup")),
                React.createElement("div", { className: "w3-container w3-white" },
                    React.createElement("table", { className: "w3-table w3-bordered w3-small w3-centered" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "Item"),
                                React.createElement("th", null, "Value"),
                                React.createElement("th", null, "Actions"))),
                        React.createElement("tbody", null,
                            React.createElement("tr", null,
                                React.createElement("td", null, "CPUs Per Instance"),
                                React.createElement("td", null, this.Setup ? this.Setup.CPUsPerInstance.toString() : null),
                                React.createElement("td", null,
                                    React.createElement("button", { disabled: !this.CanChangeField, onClick: this.getNumericFieldChangeButtonClickHandler("CPUs Per Instance", (this.Setup ? this.Setup.CPUsPerInstance : null), false, this.Implementation.Setup.setCPUsPerInstance.bind(this.Implementation.Setup)) }, "Change..."))),
                            React.createElement("tr", null,
                                React.createElement("td", null, "KeyName"),
                                React.createElement("td", null, this.Setup ? this.Setup.WorkerCharacteristic.KeyName : null),
                                React.createElement("td", null,
                                    React.createElement("button", { disabled: !this.CanChangeField }, "Change..."))),
                            React.createElement("tr", null,
                                React.createElement("td", null, "Instance Type"),
                                React.createElement("td", null, this.Setup ? this.Setup.WorkerCharacteristic.InstanceType : null),
                                React.createElement("td", null,
                                    React.createElement("button", { disabled: !this.CanChangeField }, "Change..."))),
                            React.createElement("tr", null,
                                React.createElement("td", null, "Image Id"),
                                React.createElement("td", null, this.Setup ? this.Setup.WorkerCharacteristic.ImageId : null),
                                React.createElement("td", null,
                                    React.createElement("button", { disabled: !this.CanChangeField }, "Change..."))),
                            React.createElement("tr", null,
                                React.createElement("td", null, "Security Group Id"),
                                React.createElement("td", null, this.Setup ? this.Setup.WorkerCharacteristic.SecurityGroupId : null),
                                React.createElement("td", null,
                                    React.createElement("button", { disabled: !this.CanChangeField }, "Change..."))),
                            React.createElement("tr", null,
                                React.createElement("td", null, "Subnet Id"),
                                React.createElement("td", null, this.Setup ? this.Setup.WorkerCharacteristic.SubnetId : null),
                                React.createElement("td", null,
                                    React.createElement("button", { disabled: !this.CanChangeField }, "Change...")))))))));
    };
    return ImplApp;
}(React.Component));
ReactDOM.render(React.createElement(ImplApp, { implementation: impl, apiCore: implApiCore }), document.getElementById('main'));

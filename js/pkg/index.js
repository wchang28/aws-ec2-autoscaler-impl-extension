"use strict";
var express = require("express");
var grid_autoscaler_impl_pkg_1 = require("grid-autoscaler-impl-pkg");
var $node = require("rest-node");
var rcf = require("rcf");
var eventStreamPathname = '/services/events/event_stream';
var clientOptions = { reconnetIntervalMS: 5000 };
var ApiCore = (function () {
    function ApiCore(connectOptions) {
        var $driver = $node.get();
        this.__authApi = new rcf.AuthorizedRestApi($driver, rcf.AuthorizedRestApi.connectOptionsToAccess(connectOptions));
    }
    ApiCore.prototype.$J = function (method, pathname, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.__authApi.$JP(method, pathname, data)
                .then(function (result) {
                resolve(result.ret);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    ApiCore.prototype.$M = function () { return this.__authApi.$M(eventStreamPathname, clientOptions); };
    ApiCore.prototype.subpath = function (pathname) {
        var access = (this.__authApi.access ? JSON.parse(JSON.stringify(this.__authApi.access)) : {});
        access.instance_url = this.__authApi.instance_url + pathname;
        return new ApiCore(access);
    };
    return ApiCore;
}());
var WorkerCharacteristicSetup = (function () {
    function WorkerCharacteristicSetup(api) {
        this.api = api;
    }
    WorkerCharacteristicSetup.prototype.getKeyName = function () { return this.api.$J("GET", '/get_key_name', {}); };
    WorkerCharacteristicSetup.prototype.setKeyName = function (value) { return this.api.$J("POST", '/set_key_name', value); };
    WorkerCharacteristicSetup.prototype.getInstanceType = function () { return this.api.$J("GET", '/get_instance_type', {}); };
    WorkerCharacteristicSetup.prototype.setInstanceType = function (value) { return this.api.$J("POST", '/set_instance_type', value); };
    WorkerCharacteristicSetup.prototype.getImageId = function () { return this.api.$J("GET", '/get_image_id', {}); };
    WorkerCharacteristicSetup.prototype.setImageId = function (value) { return this.api.$J("POST", '/set_image_id', value); };
    WorkerCharacteristicSetup.prototype.getSecurityGroupId = function () { return this.api.$J("GET", '/get_security_group_id', {}); };
    WorkerCharacteristicSetup.prototype.setSecurityGroupId = function (value) { return this.api.$J("POST", '/set_security_group_id', value); };
    WorkerCharacteristicSetup.prototype.getSubnetId = function () { return this.api.$J("GET", '/get_subnet_id', {}); };
    WorkerCharacteristicSetup.prototype.setSubnetId = function (value) { return this.api.$J("POST", '/set_subnet_id', value); };
    return WorkerCharacteristicSetup;
}());
var Setup = (function () {
    function Setup(api) {
        this.api = api;
    }
    Setup.prototype.toJSON = function () { return this.api.$J("GET", '/', {}); };
    Setup.prototype.getCPUsPerInstance = function () { return this.api.$J("GET", '/get_cpus_per_instance', {}); };
    Setup.prototype.setCPUsPerInstance = function (value) { return this.api.$J("POST", '/set_cpus_per_instance', value); };
    Object.defineProperty(Setup.prototype, "WorkerCharacteristic", {
        get: function () { return new WorkerCharacteristicSetup(this.api.subpath('/worker_characteristic')); },
        enumerable: true,
        configurable: true
    });
    return Setup;
}());
var Implementation = (function () {
    function Implementation(connectOptions, onChange) {
        var _this = this;
        this.api = new ApiCore(rcf.AuthorizedRestApi.connectOptionsToAccess(connectOptions));
        this.msgClient = this.api.$M();
        this.msgClient.on('connect', function (conn_id) {
            var sub_id = _this.msgClient.subscribe('/topic/implementation/setup', function (msg) {
                onChange();
            }, function (err) {
                console.error('!!! Error: ' + JSON.stringify(err));
            });
        }).on('error', function (err) {
            console.error('!!! Error: ' + JSON.stringify(err));
        });
    }
    Implementation.prototype.TranslateToWorkerKeys = function (workers) { return this.api.$J("GET", '/services/translate_to_worker_keys', {}); };
    Implementation.prototype.EstimateWorkersLaunchRequest = function (state) { return this.api.$J("GET", '/services/estimate_workers_launch_request', {}); };
    Implementation.prototype.LaunchInstances = function (launchRequest) { return this.api.$J("POST", '/services/launch_instances', launchRequest); };
    Implementation.prototype.TerminateInstances = function (workerKeys) { return this.api.$J("POST", '/services/terminate_instances', workerKeys); };
    Implementation.prototype.getInfo = function () { return this.api.$J("GET", '/services/info', {}); };
    Object.defineProperty(Implementation.prototype, "Setup", {
        get: function () { return new Setup(this.api.subpath('/services/setup')); },
        enumerable: true,
        configurable: true
    });
    return Implementation;
}());
// factory function
var factory = function (getImpl, connectOptions, onChange) {
    var router = express.Router();
    router.get('/info', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (impl) {
        return impl.getInfo();
    }));
    var impl = new Implementation(connectOptions, onChange);
    return Promise.resolve([impl, router]);
};
exports.factory = factory;

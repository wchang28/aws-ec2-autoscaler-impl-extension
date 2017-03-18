"use strict";
var express = require("express");
var grid_autoscaler_impl_pkg_1 = require("grid-autoscaler-impl-pkg");
var $node = require("rest-node");
var rcf = require("rcf");
var grid_client_core_1 = require("grid-client-core");
var eventStreamPathname = '/services/events/event_stream';
var clientOptions = { reconnetIntervalMS: 5000 };
// server must implement the following pathname
/*
    /services/events/event_stream
    /services/translate_to_worker_keys
    /services/estimate_workers_launch_request
    /services/launch_instances
    /services/terminate_instances
    /services/info
    /services/setup
    /services/setup/get_cpus_per_instance
    /services/setup/set_cpus_per_instance
    /services/setup/worker_characteristic
    /services/setup/worker_characteristic/get_key_name
    /services/setup/worker_characteristic/set_key_name
    /services/setup/worker_characteristic/get_instance_type
    /services/setup/worker_characteristic/set_instance_type
    /services/setup/worker_characteristic/get_image_id
    /services/setup/worker_characteristic/set_image_id
    /services/setup/worker_characteristic/get_security_group_id
    /services/setup/worker_characteristic/set_security_group_id
    /services/setup/worker_characteristic/get_subnet_id
    /services/setup/worker_characteristic/set_subnet_id
*/
var WorkerCharacteristicSetup = (function () {
    function WorkerCharacteristicSetup(api) {
        this.api = api;
    }
    WorkerCharacteristicSetup.prototype.toJSON = function () { return this.api.$J("GET", '/', {}); };
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
var ImplementationSetup = (function () {
    function ImplementationSetup(api) {
        this.api = api;
    }
    ImplementationSetup.prototype.toJSON = function () { return this.api.$J("GET", '/', {}); };
    ImplementationSetup.prototype.getCPUsPerInstance = function () { return this.api.$J("GET", '/get_cpus_per_instance', {}); };
    ImplementationSetup.prototype.setCPUsPerInstance = function (value) { return this.api.$J("POST", '/set_cpus_per_instance', value); };
    Object.defineProperty(ImplementationSetup.prototype, "WorkerCharacteristic", {
        get: function () { return new WorkerCharacteristicSetup(this.api.mount('/worker_characteristic')); },
        enumerable: true,
        configurable: true
    });
    return ImplementationSetup;
}());
var Implementation = (function () {
    function Implementation(connectOptions, onChange) {
        var _this = this;
        this.api = new grid_client_core_1.ApiCore($node.get(), rcf.AuthorizedRestApi.connectOptionsToAccess(connectOptions), null);
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
        get: function () { return new ImplementationSetup(this.api.mount('/services/setup')); },
        enumerable: true,
        configurable: true
    });
    return Implementation;
}());
/*
    /info
    /setup
    /setup/get_cpus_per_instance
    /setup/set_cpus_per_instance
    /setup/worker_characteristic
    /setup/worker_characteristic/get_key_name
    /setup/worker_characteristic/set_key_name
    /setup/worker_characteristic/get_instance_type
    /setup/worker_characteristic/set_instance_type
    /setup/worker_characteristic/get_image_id
    /setup/worker_characteristic/set_image_id
    /setup/worker_characteristic/get_security_group_id
    /setup/worker_characteristic/set_security_group_id
    /setup/worker_characteristic/get_subnet_id
    /setup/worker_characteristic/set_subnet_id
*/
// factory function
var factory = function (getImpl, connectOptions, onChange) {
    var router = express.Router();
    var setupRouter = express.Router();
    var wcRouter = express.Router();
    router.get('/info', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.getInfo();
    }));
    router.use('/setup', setupRouter);
    setupRouter.get('/', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.toJSON();
    }));
    setupRouter.get('/get_cpus_per_instance', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.getCPUsPerInstance();
    }));
    setupRouter.post('/set_cpus_per_instance', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.setCPUsPerInstance(req.body);
    }));
    setupRouter.use('/worker_characteristic', wcRouter);
    wcRouter.get('/', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.toJSON();
    }));
    wcRouter.get('/get_key_name', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.getKeyName();
    }));
    wcRouter.post('/set_key_name', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.setKeyName(req.body);
    }));
    wcRouter.get('/get_instance_type', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.getInstanceType();
    }));
    wcRouter.post('/set_instance_type', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.setInstanceType(req.body);
    }));
    wcRouter.get('get_image_id', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.getImageId();
    }));
    wcRouter.post('/set_image_id', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.setImageId(req.body);
    }));
    wcRouter.get('/get_security_group_id', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.getSecurityGroupId();
    }));
    wcRouter.post('/set_security_group_id', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.setSecurityGroupId(req.body);
    }));
    wcRouter.get('/get_subnet_id', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.getSubnetId();
    }));
    wcRouter.post('/set_subnet_id', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.Setup.WorkerCharacteristic.setSubnetId(req.body);
    }));
    var impl = new Implementation(connectOptions, onChange);
    return Promise.resolve([impl, router]);
};
exports.factory = factory;

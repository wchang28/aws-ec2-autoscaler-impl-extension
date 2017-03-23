"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var grid_autoscaler_impl_pkg_1 = require("grid-autoscaler-impl-pkg");
var $node = require("rest-node");
var grid_client_core_1 = require("grid-client-core");
var implApi_1 = require("../implApi");
var utils_1 = require("../utils");
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
var ImplementationProxy = (function () {
    function ImplementationProxy(access, onChange) {
        var _this = this;
        this.api = new grid_client_core_1.ApiCore($node.get(), access, null);
        this.msgClient = this.api.$M();
        this.msgClient.on('connect', function (conn_id) {
            console.log("connected to the aws ec2 auto-scaler impl. server :-) conn_id=" + conn_id);
            _this.msgClient.subscribe(utils_1.Utils.getImplementationSetupTopic(), function (msg) {
                onChange();
            }, {})
                .then(function (sub_id) {
                console.log("subscription to topic '" + utils_1.Utils.getImplementationSetupTopic() + "' is successful :-) sub_id=" + sub_id);
            }).catch(function (err) {
                console.error("'!!! Error subscribing to topic '" + utils_1.Utils.getImplementationSetupTopic() + ": " + JSON.stringify(err));
            });
        }).on('error', function (err) {
            console.error('!!! Error: ' + JSON.stringify(err));
        });
    }
    ImplementationProxy.prototype.TranslateToWorkerKeys = function (workers) { return this.api.$J("POST", '/services/translate_to_worker_keys', workers); };
    ImplementationProxy.prototype.EstimateWorkersLaunchRequest = function (state) { return this.api.$J("POST", '/services/estimate_workers_launch_request', state); };
    ImplementationProxy.prototype.LaunchInstances = function (launchRequest) { return this.api.$J("POST", '/services/launch_instances', launchRequest); };
    ImplementationProxy.prototype.TerminateInstances = function (workerKeys) { return this.api.$J("POST", '/services/terminate_instances', workerKeys); };
    ImplementationProxy.prototype.getInfo = function () { return this.api.$J("GET", '/services/info', {}); };
    Object.defineProperty(ImplementationProxy.prototype, "Setup", {
        get: function () { return implApi_1.getImplementationSetup(this.api.mount('/services/setup')); },
        enumerable: true,
        configurable: true
    });
    return ImplementationProxy;
}());
/* implementation API extension
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
var factory = function (getImpl, access, onChange) {
    var implApiRouter = express.Router();
    var setupRouter = express.Router();
    var wcRouter = express.Router();
    implApiRouter.get('/info', grid_autoscaler_impl_pkg_1.getRequestHandlerForImplementation(getImpl, function (req, impl) {
        return impl.getInfo();
    }));
    implApiRouter.use('/setup', setupRouter);
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
    var impl = new ImplementationProxy(access, onChange);
    return Promise.resolve([impl, implApiRouter]);
};
exports.factory = factory;

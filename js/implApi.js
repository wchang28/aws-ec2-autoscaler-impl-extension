"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    /setup/worker_characteristic/get_iam_role_name
    /setup/worker_characteristic/set_iam_role_name
*/
var WorkerCharacteristicSetup = /** @class */ (function () {
    function WorkerCharacteristicSetup(api) {
        this.api = api;
    }
    WorkerCharacteristicSetup.prototype.toJSON = function () { return this.api.$J("GET", '/', {}); };
    WorkerCharacteristicSetup.prototype.getKeyName = function () { return this.api.$J("GET", '/get_key_name', {}); };
    WorkerCharacteristicSetup.prototype.setKeyName = function (value) { return this.api.$J("POST", '/set_key_name', { value: value }); };
    WorkerCharacteristicSetup.prototype.getInstanceType = function () { return this.api.$J("GET", '/get_instance_type', {}); };
    WorkerCharacteristicSetup.prototype.setInstanceType = function (value) { return this.api.$J("POST", '/set_instance_type', { value: value }); };
    WorkerCharacteristicSetup.prototype.getImageId = function () { return this.api.$J("GET", '/get_image_id', {}); };
    WorkerCharacteristicSetup.prototype.setImageId = function (value) { return this.api.$J("POST", '/set_image_id', { value: value }); };
    WorkerCharacteristicSetup.prototype.getSecurityGroupId = function () { return this.api.$J("GET", '/get_security_group_id', {}); };
    WorkerCharacteristicSetup.prototype.setSecurityGroupId = function (value) { return this.api.$J("POST", '/set_security_group_id', { value: value }); };
    WorkerCharacteristicSetup.prototype.getSubnetId = function () { return this.api.$J("GET", '/get_subnet_id', {}); };
    WorkerCharacteristicSetup.prototype.setSubnetId = function (value) { return this.api.$J("POST", '/set_subnet_id', { value: value }); };
    WorkerCharacteristicSetup.prototype.getIAMRoleName = function () { return this.api.$J("GET", '/get_iam_role_name', {}); };
    WorkerCharacteristicSetup.prototype.setIAMRoleName = function (value) { return this.api.$J("POST", '/set_iam_role_name', { value: value }); };
    return WorkerCharacteristicSetup;
}());
var ImplementationSetup = /** @class */ (function () {
    function ImplementationSetup(api) {
        this.api = api;
    }
    ImplementationSetup.prototype.toJSON = function () { return this.api.$J("GET", '/', {}); };
    ImplementationSetup.prototype.getCPUsPerInstance = function () { return this.api.$J("GET", '/get_cpus_per_instance', {}); };
    ImplementationSetup.prototype.setCPUsPerInstance = function (value) { return this.api.$J("POST", '/set_cpus_per_instance', { value: value }); };
    Object.defineProperty(ImplementationSetup.prototype, "WorkerCharacteristic", {
        get: function () { return new WorkerCharacteristicSetup(this.api.mount('/worker_characteristic')); },
        enumerable: true,
        configurable: true
    });
    return ImplementationSetup;
}());
var Implementation = /** @class */ (function () {
    function Implementation(api) {
        this.api = api;
    }
    Implementation.prototype.getInfo = function () { return this.api.$J("GET", '/info', {}); };
    Object.defineProperty(Implementation.prototype, "Setup", {
        get: function () { return new ImplementationSetup(this.api.mount('/setup')); },
        enumerable: true,
        configurable: true
    });
    return Implementation;
}());
function getImplementationSetup(api) { return new ImplementationSetup(api); }
exports.getImplementationSetup = getImplementationSetup;
function getImplementation(api) { return new Implementation(api); }
exports.getImplementation = getImplementation;

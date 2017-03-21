"use strict";
// route /services/setup/worker_characteristic
var express = require("express");
var requestData_1 = require("../../../requestData");
var router = express.Router();
exports.Router = router;
/*
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
router.get('/', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.WorkerCharacteristic); }));
router.get('/get_key_name', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.WorkerCharacteristic.KeyName); }));
router.post('/set_key_name', requestData_1.getReqestHandler(function (impl, req) {
    impl.WorkerCharacteristic.KeyName = req.body.value;
    return Promise.resolve({});
}));
router.get('/get_instance_type', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.WorkerCharacteristic.InstanceType); }));
router.post('/set_instance_type', requestData_1.getReqestHandler(function (impl, req) {
    impl.WorkerCharacteristic.InstanceType = req.body.value;
    return Promise.resolve({});
}));
router.get('/get_image_id', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.WorkerCharacteristic.ImageId); }));
router.post('/set_image_id', requestData_1.getReqestHandler(function (impl, req) {
    impl.WorkerCharacteristic.ImageId = req.body.value;
    return Promise.resolve({});
}));
router.get('/get_security_group_id', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.WorkerCharacteristic.SecurityGroupId); }));
router.post('/set_security_group_id', requestData_1.getReqestHandler(function (impl, req) {
    impl.WorkerCharacteristic.SecurityGroupId = req.body.value;
    return Promise.resolve({});
}));
router.get('/get_subnet_id', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.WorkerCharacteristic.SubnetId); }));
router.post('/set_subnet_id', requestData_1.getReqestHandler(function (impl, req) {
    impl.WorkerCharacteristic.SubnetId = req.body.value;
    return Promise.resolve({});
}));

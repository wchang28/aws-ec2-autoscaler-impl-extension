"use strict";
// route /services/setup
var express = require("express");
var requestData_1 = require("../../requestData");
var worker_characteristic_1 = require("./worker_characteristic");
var router = express.Router();
exports.Router = router;
/*
/services/setup
/services/setup/get_cpus_per_instance
/services/setup/set_cpus_per_instance
/services/setup/worker_characteristic
*/
router.get('/', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.toJSON()); }));
router.get('/get_cpus_per_instance', requestData_1.getReqestHandler(function (impl, req) { return Promise.resolve(impl.CPUsPerInstance); }));
router.post('/set_cpus_per_instance', requestData_1.getReqestHandler(function (impl, req) {
    impl.CPUsPerInstance = req.body.value;
    return Promise.resolve(impl.CPUsPerInstance);
}));
router.use('/worker_characteristic', worker_characteristic_1.Router);

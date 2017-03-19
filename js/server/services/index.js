"use strict";
// route /services
var express = require("express");
var requestData_1 = require("../requestData");
var setup_1 = require("./setup");
var router = express.Router();
exports.Router = router;
/*
    /services/events/event_stream
    /services/translate_to_worker_keys
    /services/estimate_workers_launch_request
    /services/launch_instances
    /services/terminate_instances
    /services/info
    /services/setup
*/
router.post('/translate_to_worker_keys', requestData_1.getReqestHandler(function (impl, req) { return impl.TranslateToWorkerKeys(req.body); }));
router.post('/estimate_workers_launch_request', requestData_1.getReqestHandler(function (impl, req) { return impl.EstimateWorkersLaunchRequest(req.body); }));
router.post('/launch_instances', requestData_1.getReqestHandler(function (impl, req) { return impl.LaunchInstances(req.body); }));
router.post('/terminate_instances', requestData_1.getReqestHandler(function (impl, req) { return impl.TerminateInstances(req.body); }));
router.get('/info', requestData_1.getReqestHandler(function (impl, req) { return impl.getInfo(); }));
router.use('/setup', setup_1.Router);

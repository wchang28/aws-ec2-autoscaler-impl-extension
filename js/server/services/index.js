"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// route /services
var express = require("express");
var requestData_1 = require("../requestData");
var setup_1 = require("./setup");
var tr = require("rcf-message-router");
var utils_1 = require("../../utils");
var router = express.Router();
exports.Router = router;
var destAuthRouter = express.Router();
destAuthRouter.use(tr.destAuth(function (req, res, next) {
    if (req.authMode == tr.DestAuthMode.SendMsg)
        res.reject();
    else
        next();
}));
destAuthRouter.get(utils_1.Utils.getImplementationSetupTopic(), tr.destAuth(function (req, res) {
    res.accept();
}));
var options = {
    connKeepAliveIntervalMS: 10000,
    dispatchMsgOnClientSend: false,
    destinationAuthorizeRouter: destAuthRouter
};
var ret = tr.get('/event_stream', options);
router.use('/events', ret.router); // topic subscription endpoint is available at /events/event_stream from this route
var connectionsManager = ret.connectionsManager;
exports.ConnectionsManager = connectionsManager;
connectionsManager.on('client_connect', function (req, connection) {
    console.log('client ' + connection.id + ' @ ' + connection.remoteAddress + ' connected to the SSE topic endpoint');
}).on('client_disconnect', function (req, connection) {
    console.log('client ' + connection.id + ' @ ' + connection.remoteAddress + ' disconnected from the SSE topic endpoint');
});
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

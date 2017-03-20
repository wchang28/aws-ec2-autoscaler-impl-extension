// route /services
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {getReqestHandler} from '../requestData';
import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";
import {Router as setupRouter} from './setup';
import * as tr from 'rcf-message-router';
import {Utils} from '../../utils';

let router = express.Router();

let destAuthRouter = express.Router();

destAuthRouter.use(tr.destAuth((req: tr.DestAuthRequest, res: tr.DestAuthResponse, next: express.NextFunction) => {
    if (req.authMode == tr.DestAuthMode.SendMsg)
        res.reject();
    else
        next();
}));

destAuthRouter.get(Utils.getImplementationSetupTopic(), tr.destAuth((req: tr.DestAuthRequest, res: tr.DestAuthResponse) => {
    res.accept();
}));

let options: tr.Options = {
    connKeepAliveIntervalMS: 10000
    ,dispatchMsgOnClientSend: false
    ,destinationAuthorizeRouter: destAuthRouter
}

let ret = tr.get('/event_stream', options);

router.use('/events', ret.router); // topic subscription endpoint is available at /events/event_stream from this route

let connectionsManager = ret.connectionsManager;
connectionsManager.on('client_connect', (req:express.Request, connection: tr.ITopicConnection) : void => {
    console.log('client ' + connection.id + ' @ ' + connection.remoteAddress + ' connected to the SSE topic endpoint');
}).on('client_disconnect', (req:express.Request, connection: tr.ITopicConnection) : void => {
    console.log('client ' + connection.id + ' @ ' + connection.remoteAddress +  ' disconnected from the SSE topic endpoint');
});

export {router as Router, connectionsManager as ConnectionsManager};

/*
    /services/events/event_stream
    /services/translate_to_worker_keys
    /services/estimate_workers_launch_request
    /services/launch_instances
    /services/terminate_instances
    /services/info
    /services/setup
*/

router.post('/translate_to_worker_keys', getReqestHandler((impl: EC2Implementation, req: express.Request) => impl.TranslateToWorkerKeys(req.body)));
router.post('/estimate_workers_launch_request', getReqestHandler((impl: EC2Implementation, req: express.Request) => impl.EstimateWorkersLaunchRequest(req.body)));
router.post('/launch_instances', getReqestHandler((impl: EC2Implementation, req: express.Request) => impl.LaunchInstances(req.body)));
router.post('/terminate_instances', getReqestHandler((impl: EC2Implementation, req: express.Request) => impl.TerminateInstances(req.body)));
router.get('/info', getReqestHandler((impl: EC2Implementation, req: express.Request) => impl.getInfo()));
router.use('/setup', setupRouter);

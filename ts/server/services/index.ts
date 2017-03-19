// route /services
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {getReqestHandler} from '../requestData';
import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";
import {IWorker, WorkerKey} from 'autoscalable-grid';

let router = express.Router();

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

export {router as Router};
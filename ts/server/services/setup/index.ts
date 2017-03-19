// route /services/setup
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {getReqestHandler} from '../../requestData';
import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";

let router = express.Router();
export {router as Router};

/*
/services/setup
/services/setup/get_cpus_per_instance
/services/setup/set_cpus_per_instance
/services/setup/worker_characteristic
*/

router.get('/', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.toJSON())));
router.get('/get_cpus_per_instance', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.CPUsPerInstance)));
router.post('/set_cpus_per_instance', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.CPUsPerInstance = req.body;
    return Promise.resolve<any>({});
}));
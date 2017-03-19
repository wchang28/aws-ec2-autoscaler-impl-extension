// route /services/setup/worker_characteristic
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {getReqestHandler} from '../../../requestData';
import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";

let router = express.Router();
export {router as Router};

// route /services/setup/worker_characteristic
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {getReqestHandler} from '../../../requestData';
import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";

let router = express.Router();
export {router as Router};

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
    /setup/worker_characteristic/get_iam_role_name
    /setup/worker_characteristic/set_iam_role_name
    /setup/worker_characteristic/get_name_tag
    /setup/worker_characteristic/set_name_tag
 */

router.get('/', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic)));
router.get('/get_key_name', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.KeyName)));
router.post('/set_key_name', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.KeyName = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.KeyName);
}));
router.get('/get_instance_type', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.InstanceType)));
router.post('/set_instance_type', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.InstanceType = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.InstanceType);
}));
router.get('/get_image_id', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.ImageId)));
router.post('/set_image_id', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.ImageId = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.ImageId);
}));
router.get('/get_security_group_id', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.SecurityGroupId)));
router.post('/set_security_group_id', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.SecurityGroupId = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.SecurityGroupId);
}));

router.get('/get_subnet_id', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.SubnetId)));
router.post('/set_subnet_id', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.SubnetId = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.SubnetId);
}));

router.get('/get_iam_role_name', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.IAMRoleName)));
router.post('/set_iam_role_name', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.IAMRoleName = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.IAMRoleName);
}));

router.get('/get_name_tag', getReqestHandler((impl: EC2Implementation, req: express.Request) => Promise.resolve<any>(impl.WorkerCharacteristic.NameTag)));
router.post('/set_name_tag', getReqestHandler((impl: EC2Implementation, req: express.Request) => {
    impl.WorkerCharacteristic.NameTag = req.body.value;
    return Promise.resolve<any>(impl.WorkerCharacteristic.NameTag);
}));
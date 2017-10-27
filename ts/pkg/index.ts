import {IAutoScalerImplementation, IWorker, WorkerKey, IAutoScalableState, IWorkersLaunchRequest, WorkerInstance, AutoScalerImplementationInfo} from 'autoscalable-grid';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {AutoScalerImplementationFactory, AutoScalerImplementationOnChangeHandler, GetAutoScalerImplementationProc, getRequestHandlerForImplementation} from 'grid-autoscaler-impl-pkg';
import {IImplementationSetup} from "aws-ec2-autoscaler-impl";
import * as $node from 'rest-node';
import * as rcf from 'rcf';
import { EC2 } from 'aws-sdk';
import {ApiCore, IMessageClient, GridMessage} from "grid-client-core";
import {getImplementationSetup} from '../implApi';
import {Utils} from '../utils';

let eventStreamPathname = '/services/events/event_stream';
let clientOptions: rcf.IMessageClientOptions = {reconnetIntervalMS: 5000};

// server must implement the following pathname
/*
    /services/events/event_stream
    /services/translate_to_worker_keys
    /services/estimate_workers_launch_request
    /services/launch_instances
    /services/terminate_instances
    /services/info
    /services/setup
    /services/setup/get_cpus_per_instance
    /services/setup/set_cpus_per_instance
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
    /services/setup/worker_characteristic/get_iam_role_name
    /services/setup/worker_characteristic/set_iam_role_name
*/

class ImplementationProxy implements IAutoScalerImplementation {
    private api: ApiCore<GridMessage>;
    private msgClient: IMessageClient<GridMessage>;
    constructor(access: rcf.OAuth2Access, onChange: AutoScalerImplementationOnChangeHandler) {
        this.api = new ApiCore<GridMessage>($node.get(), access, null);
        this.msgClient = this.api.$M();
        this.msgClient.on('connect', (conn_id:string) => {
            console.log("connected to the aws ec2 auto-scaler impl. server :-) conn_id=" + conn_id);
            this.msgClient.subscribe(Utils.getImplementationSetupTopic()
            ,(msg: GridMessage) => {
                onChange();
            }, {})
            .then((sub_id: string) => {
                console.log("subscription to topic '" + Utils.getImplementationSetupTopic() + "' is successful :-) sub_id=" + sub_id);
            }).catch((err: any) => {
                console.error("'!!! Error subscribing to topic '" + Utils.getImplementationSetupTopic() + ": " + JSON.stringify(err));
            });
        }).on('error', (err:any) => {
            console.error('!!! Error: ' + JSON.stringify(err));
        });
    }
    TranslateToWorkerKeys(workers: IWorker[]) : Promise<WorkerKey[]> {return this.api.$J("POST", '/services/translate_to_worker_keys', workers);}
    EstimateWorkersLaunchRequest(state: IAutoScalableState) : Promise<IWorkersLaunchRequest> {return this.api.$J("POST", '/services/estimate_workers_launch_request', state);}
    LaunchInstances(launchRequest: IWorkersLaunchRequest) : Promise<WorkerInstance[]> {return this.api.$J("POST", '/services/launch_instances', launchRequest);}
    TerminateInstances(workerKeys: WorkerKey[]) : Promise<WorkerInstance[]> {return this.api.$J("POST", '/services/terminate_instances', workerKeys);}
    getInfo() : Promise<AutoScalerImplementationInfo> {return this.api.$J("GET", '/services/info', {});}

    get Setup(): IImplementationSetup { return getImplementationSetup(this.api.mount('/services/setup'));}
}

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

// factory function
let factory: AutoScalerImplementationFactory = (getImpl: GetAutoScalerImplementationProc, access: rcf.OAuth2Access, onChange: AutoScalerImplementationOnChangeHandler) => {
    let implApiRouter = express.Router();
    let setupRouter = express.Router();
    let wcRouter = express.Router();

    implApiRouter.get('/info', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.getInfo();
    }));
    implApiRouter.use('/setup', setupRouter);

    setupRouter.get('/', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.toJSON();
    }));
    setupRouter.get('/get_cpus_per_instance', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.getCPUsPerInstance();
    }));
    setupRouter.post('/set_cpus_per_instance', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.setCPUsPerInstance(req.body.value);
    }));

    setupRouter.use('/worker_characteristic', wcRouter);

    wcRouter.get('/', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.toJSON();
    }));
    wcRouter.get('/get_key_name', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.getKeyName();
    }));
    wcRouter.post('/set_key_name', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.setKeyName(req.body.value);
    }));
    wcRouter.get('/get_instance_type', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.getInstanceType();
    }));
    wcRouter.post('/set_instance_type', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.setInstanceType(req.body.value);
    }));
    wcRouter.get('get_image_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.getImageId();
    }));
    wcRouter.post('/set_image_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.setImageId(req.body.value);
    }));
    wcRouter.get('/get_security_group_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.getSecurityGroupId();
    }));
    wcRouter.post('/set_security_group_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.setSecurityGroupId(req.body.value);
    }));
    wcRouter.get('/get_subnet_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.getSubnetId();
    }));
    wcRouter.post('/set_subnet_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.setSubnetId(req.body.value);
    }));
    wcRouter.get('/get_iam_role_name', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.getIAMRoleName();
    }));
    wcRouter.post('/set_iam_role_name', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: ImplementationProxy) => {
        return impl.Setup.WorkerCharacteristic.setIAMRoleName(req.body.value);
    }));

    let impl = new ImplementationProxy(access, onChange);
    return Promise.resolve<[IAutoScalerImplementation, express.Router]>([impl, implApiRouter]);
};

export {factory};
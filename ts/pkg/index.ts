import {IAutoScalerImplementation, IWorker, WorkerKey, IAutoScalableState, IWorkersLaunchRequest, WorkerInstance, AutoScalerImplementationInfo} from 'autoscalable-grid';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {AutoScalerImplementationFactory, AutoScalerImplementationOnChangeHandler, GetAutoScalerImplementationProc, getRequestHandlerForImplementation} from 'grid-autoscaler-impl-pkg';
import {IWorkerCharacteristic, IImplementationSetup, IWorkerCharacteristicSetup, ImplementationJSON} from "aws-ec2-autoscaler-impl";
import * as $node from 'rest-node';
import * as rcf from 'rcf';
import { EC2 } from 'aws-sdk'

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
*/

class ApiCore {
    private __authApi: rcf.AuthorizedRestApi;
    constructor($driver: rcf.$Driver, connectOptions: rcf.ApiInstanceConnectOptions) {
        this.__authApi = new rcf.AuthorizedRestApi($driver, rcf.AuthorizedRestApi.connectOptionsToAccess(connectOptions));
    }
    $J(method: string, pathname: string, data: any) : Promise<any> {
        return new Promise<any>((resolve: (value: any) => void, reject: (err: any) => void) => {
            this.__authApi.$JP(method, pathname, data)
            .then((result: rcf.RestReturn) => {
                resolve(result.ret);
            }).catch((err: any) => {
                reject(err);
            });
        });
    }
    $M() : rcf.IMessageClient {return this.__authApi.$M(eventStreamPathname, clientOptions);}
    mount(pathname: string): ApiCore {
        let access:rcf.OAuth2Access = (this.__authApi.access ? JSON.parse(JSON.stringify(this.__authApi.access)) : {});
        access.instance_url = this.__authApi.instance_url + pathname;
        return new ApiCore(this.__authApi.$driver, access);
    }
}

class WorkerCharacteristicSetup implements IWorkerCharacteristicSetup {
    constructor(private api: ApiCore) {}
    toJSON(): Promise<IWorkerCharacteristic> {return this.api.$J("GET", '/', {});}
    getKeyName(): Promise<string> {return this.api.$J("GET", '/get_key_name', {});}
    setKeyName(value: string): Promise<string> {return this.api.$J("POST", '/set_key_name', value);}
    getInstanceType(): Promise<EC2.InstanceType> {return this.api.$J("GET", '/get_instance_type', {});}
    setInstanceType(value: EC2.InstanceType): Promise<EC2.InstanceType> {return this.api.$J("POST", '/set_instance_type', value);}
    getImageId(): Promise<string> {return this.api.$J("GET", '/get_image_id', {});}
    setImageId(value: string): Promise<string> {return this.api.$J("POST", '/set_image_id', value);}
    getSecurityGroupId(): Promise<string> {return this.api.$J("GET", '/get_security_group_id', {});}
    setSecurityGroupId(value: string): Promise<string> {return this.api.$J("POST", '/set_security_group_id', value);}
    getSubnetId(): Promise<string> {return this.api.$J("GET", '/get_subnet_id', {});}
    setSubnetId(value: string): Promise<string> {return this.api.$J("POST", '/set_subnet_id', value);}
}

class Setup implements IImplementationSetup {
    constructor(private api: ApiCore) {}
    toJSON() : Promise<ImplementationJSON> {return this.api.$J("GET", '/', {});}
    getCPUsPerInstance() : Promise<number> {return this.api.$J("GET", '/get_cpus_per_instance', {});}
    setCPUsPerInstance(value: number) : Promise<number> {return this.api.$J("POST", '/set_cpus_per_instance', value);}
    get WorkerCharacteristic(): IWorkerCharacteristicSetup {return new WorkerCharacteristicSetup(this.api.mount('/worker_characteristic'));}
}

class Implementation implements IAutoScalerImplementation {
    private api: ApiCore;
    private msgClient: rcf.IMessageClient;
    constructor(connectOptions: rcf.ApiInstanceConnectOptions, onChange: AutoScalerImplementationOnChangeHandler) {
        this.api = new ApiCore($node.get(), rcf.AuthorizedRestApi.connectOptionsToAccess(connectOptions));
        this.msgClient = this.api.$M();
        this.msgClient.on('connect', (conn_id:string) => {
            let sub_id = this.msgClient.subscribe('/topic/implementation/setup'
            ,(msg: rcf.IMessage) => {
                onChange();
            }, (err: any) => {
                console.error('!!! Error: ' + JSON.stringify(err));
            })
        }).on('error', (err:any) => {
            console.error('!!! Error: ' + JSON.stringify(err));
        });
    }
    TranslateToWorkerKeys(workers: IWorker[]) : Promise<WorkerKey[]> {return this.api.$J("GET", '/services/translate_to_worker_keys', {});}
    EstimateWorkersLaunchRequest(state: IAutoScalableState) : Promise<IWorkersLaunchRequest> {return this.api.$J("GET", '/services/estimate_workers_launch_request', {});}
    LaunchInstances(launchRequest: IWorkersLaunchRequest) : Promise<WorkerInstance[]> {return this.api.$J("POST", '/services/launch_instances', launchRequest);}
    TerminateInstances(workerKeys: WorkerKey[]) : Promise<WorkerInstance[]> {return this.api.$J("POST", '/services/terminate_instances', workerKeys);}
    getInfo() : Promise<AutoScalerImplementationInfo> {return this.api.$J("GET", '/services/info', {});}

    get Setup(): IImplementationSetup { return new Setup(this.api.mount('/services/setup'));}
}

/*
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
*/

// factory function
let factory: AutoScalerImplementationFactory = (getImpl: GetAutoScalerImplementationProc, connectOptions: rcf.ApiInstanceConnectOptions, onChange: AutoScalerImplementationOnChangeHandler) => {
    let router = express.Router();
    let setupRouter = express.Router();
    let wcRouter = express.Router();

    router.get('/info', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.getInfo();
    }));
    router.use('/setup', setupRouter);

    setupRouter.get('/', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.toJSON();
    }));
    setupRouter.get('/get_cpus_per_instance', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.getCPUsPerInstance();
    }));
    setupRouter.post('/set_cpus_per_instance', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.setCPUsPerInstance(req.body);
    }));

    setupRouter.use('/worker_characteristic', wcRouter);

    wcRouter.get('/', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.toJSON();
    }));
    wcRouter.get('/get_key_name', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.getKeyName();
    }));
    wcRouter.post('/set_key_name', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.setKeyName(req.body);
    }));
    wcRouter.get('/get_instance_type', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.getInstanceType();
    }));
    wcRouter.post('/set_instance_type', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.setInstanceType(req.body);
    }));
    wcRouter.get('get_image_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.getImageId();
    }));
    wcRouter.post('/set_image_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.setImageId(req.body);
    }));
    wcRouter.get('/get_security_group_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.getSecurityGroupId();
    }));
    wcRouter.post('/set_security_group_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.setSecurityGroupId(req.body);
    }));
    wcRouter.get('/get_subnet_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.getSubnetId();
    }));
    wcRouter.post('/set_subnet_id', getRequestHandlerForImplementation(getImpl, (req: express.Request, impl: Implementation) => {
        return impl.Setup.WorkerCharacteristic.setSubnetId(req.body);
    }));


    let impl = new Implementation(connectOptions, onChange);
    return Promise.resolve<[IAutoScalerImplementation, express.Router]>([impl, router]);
};

export {factory};
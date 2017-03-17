import {IAutoScalerImplementation, IWorker, WorkerKey, IAutoScalableState, IWorkersLaunchRequest, WorkerInstance, AutoScalerImplementationInfo} from 'autoscalable-grid';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {AutoScalerImplementationFactory, AutoScalerImplementationOnChangeHandler, GetAutoScalerImplementationProc, getRequestHandlerForImplementation} from 'grid-autoscaler-impl-pkg';

interface Options {
}

class Implementation implements IAutoScalerImplementation {
    constructor(options: Options, onChange: AutoScalerImplementationOnChangeHandler) {

    }
    TranslateToWorkerKeys(workers: IWorker[]) : Promise<WorkerKey[]> {

    }
    EstimateWorkersLaunchRequest(state: IAutoScalableState) : Promise<IWorkersLaunchRequest> {

    }
    LaunchInstances(launchRequest: IWorkersLaunchRequest) : Promise<WorkerInstance[]> {

    }
    TerminateInstances(workerKeys: WorkerKey[]) : Promise<WorkerInstance[]> {

    }
    getInfo() : Promise<AutoScalerImplementationInfo> {
        
    }
}

// factory function
let factory: AutoScalerImplementationFactory = (getImpl: GetAutoScalerImplementationProc, options: Options, onChange: AutoScalerImplementationOnChangeHandler) => {
    let router = express.Router();
    router.get('/info', getRequestHandlerForImplementation(getImpl, (impl: Implementation) => {
        return impl.getInfo();
    }));
    let impl = new Implementation(options, onChange);
    return Promise.resolve<[IAutoScalerImplementation, express.Router]>([impl, router]);
};

export {factory};
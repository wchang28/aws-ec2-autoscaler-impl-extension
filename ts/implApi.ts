import {AutoScalerImplementationInfo} from 'autoscalable-grid';
import {IWorkerCharacteristic, IImplementationSetup, IWorkerCharacteristicSetup, ImplementationJSON} from "aws-ec2-autoscaler-impl";
import {EC2} from 'aws-sdk';
import {ApiCore, GridMessage} from "grid-client-core";

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
*/

class WorkerCharacteristicSetup implements IWorkerCharacteristicSetup {
    constructor(private api: ApiCore<GridMessage>) {}
    toJSON(): Promise<IWorkerCharacteristic> {return this.api.$J("GET", '/', {});}
    getKeyName(): Promise<string> {return this.api.$J("GET", '/get_key_name', {});}
    setKeyName(value: string): Promise<string> {return this.api.$J("POST", '/set_key_name', {value});}
    getInstanceType(): Promise<EC2.InstanceType> {return this.api.$J("GET", '/get_instance_type', {});}
    setInstanceType(value: EC2.InstanceType): Promise<EC2.InstanceType> {return this.api.$J("POST", '/set_instance_type', {value});}
    getImageId(): Promise<string> {return this.api.$J("GET", '/get_image_id', {});}
    setImageId(value: string): Promise<string> {return this.api.$J("POST", '/set_image_id', {value});}
    getSecurityGroupId(): Promise<string> {return this.api.$J("GET", '/get_security_group_id', {});}
    setSecurityGroupId(value: string): Promise<string> {return this.api.$J("POST", '/set_security_group_id', {value});}
    getSubnetId(): Promise<string> {return this.api.$J("GET", '/get_subnet_id', {});}
    setSubnetId(value: string): Promise<string> {return this.api.$J("POST", '/set_subnet_id', {value});}
}

class ImplementationSetup implements IImplementationSetup {
    constructor(private api: ApiCore<GridMessage>) {}
    toJSON() : Promise<ImplementationJSON> {return this.api.$J("GET", '/', {});}
    getCPUsPerInstance() : Promise<number> {return this.api.$J("GET", '/get_cpus_per_instance', {});}
    setCPUsPerInstance(value: number) : Promise<number> {return this.api.$J("POST", '/set_cpus_per_instance', {value});}
    get WorkerCharacteristic(): IWorkerCharacteristicSetup {return new WorkerCharacteristicSetup(this.api.mount('/worker_characteristic'));}
}

export interface IImplementation {
    getInfo: () => Promise<AutoScalerImplementationInfo>;
    readonly Setup: IImplementationSetup;
}

class Implementation implements IImplementation {
    constructor(private api: ApiCore<GridMessage>) {}
    getInfo() : Promise<AutoScalerImplementationInfo> {return this.api.$J("GET", '/info', {});}
    get Setup(): IImplementationSetup {return new ImplementationSetup(this.api.mount('/setup'));}
}

export function getImplementationSetup(api: ApiCore<GridMessage>) : IImplementationSetup {return new ImplementationSetup(api);}
export function getImplementation(api: ApiCore<GridMessage>) : IImplementation {return new Implementation(api);}
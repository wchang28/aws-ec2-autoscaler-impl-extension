import { AutoScalerImplementationInfo } from 'autoscalable-grid';
import { IImplementationSetup } from "aws-ec2-autoscaler-impl";
import { ApiCore, GridMessage } from "grid-client-core";
export interface IImplementation {
    getInfo: () => Promise<AutoScalerImplementationInfo>;
    readonly Setup: IImplementationSetup;
}
export declare function getImplementationSetup(api: ApiCore<GridMessage>): IImplementationSetup;
export declare function getImplementation(api: ApiCore<GridMessage>): IImplementation;

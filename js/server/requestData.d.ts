/// <reference types="express" />
import * as express from 'express';
import { IGlobal } from './global';
import { Implementation as EC2Implementation } from "aws-ec2-autoscaler-impl";
export declare class RequestData {
    private req;
    constructor(req: express.Request);
    readonly Global: IGlobal;
    readonly Implementation: EC2Implementation;
}
export declare type Handler<T> = (implementation: EC2Implementation, req: express.Request) => Promise<T>;
export declare function getReqestHandler<T>(handler: Handler<T>): express.RequestHandler;

import * as express from 'express';
import {IGlobal} from './global';
import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";

export class RequestData {
    constructor(private req: express.Request) {}
    get Global(): IGlobal {return this.req.app.get("global");}
    get Implementation() : EC2Implementation {return this.Global.implementation;}
}

export type Handler<T> = (implementation: EC2Implementation, req: express.Request) => Promise<T>;
export function getReqestHandler<T>(handler: Handler<T>) : express.RequestHandler {
    return (req: express.Request, res: express.Response) => {
        let rd = new RequestData(req);
        handler(rd.Implementation, req)
        .then((value: T) => {
            res.jsonp(value);
        }).catch((err: any) => {
            res.status(400).json(err);
        })
    }
}

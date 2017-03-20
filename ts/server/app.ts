import {startServer} from 'express-web-server';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import {Implementation as EC2Implementation, Options as EC2Options, ImplementationJSON} from "aws-ec2-autoscaler-impl";
import { EC2 } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import {IAppConfig} from './appConfig';
import {SettingsStore} from "./settingsStore";
import {IWorker, WorkerKey} from 'autoscalable-grid';
import {IGlobal} from "./global";
import {Router as servicesRouter, ConnectionsManager as connectionsManager} from './services';

if (process.argv.length < 3) {
    console.error("config file is missiing");
    process.exit(1);
}
let configFile = process.argv[2];
let config: IAppConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

let store = new SettingsStore(config.settingsFile);

store.load()
.then((options: ImplementationJSON) => {
    let app = express();

    app.use(noCache);
    app.use(bodyParser.json({"limit":"999mb"}));
    app.use(prettyPrinter.get());
    app.set('jsonp callback name', 'cb');

    let implementation = new EC2Implementation(
        config.implementationInfo
        ,(worker: IWorker) => worker.RemoteAddress
        ,(instance: EC2.Instance) => (instance ? instance.PrivateIpAddress : null)
        ,(instance: EC2.Instance, workerKey: WorkerKey) => (instance ? instance.PrivateIpAddress === workerKey : false)
        ,options);

    implementation.on('change', () => {
        // TODO: notify change here
        store.save(implementation.toJSON())
        .then(() => {}).catch((err: any) => {
            console.error("!!! Error saving settings: " + JSON.stringify(err));
        });
    });

    let g: IGlobal = {implementation};
    app.set("global", g);

    app.use('/services', servicesRouter);

    startServer(config.webServerConfig, app, (secure:boolean, host:string, port:number) => {
        console.log('app server listening at %s://%s:%s', (secure ? 'https' : 'http'), host, port);
    });
}).catch((err: any) => {
    console.error("!! Error loading settings: " + JSON.stringify(err));
    process.exit(1);
});

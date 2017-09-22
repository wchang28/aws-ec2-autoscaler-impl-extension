import {startServer} from 'express-web-server';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import noCache = require('no-cache-express');
import * as prettyPrinter from 'express-pretty-print';
import {Implementation as EC2Implementation, Options as EC2Options, ImplementationJSON} from "aws-ec2-autoscaler-impl";
import * as AWS from 'aws-sdk';
import { EC2 } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import {IAppConfig} from './appConfig';
import {SettingsStore} from "./settingsStore";
import {IWorker, WorkerKey} from 'autoscalable-grid';
import {IGlobal} from "./global";
import {Router as servicesRouter, ConnectionsManager as connectionsManager} from './services';
import {GridMessage} from 'grid-client-core';
import {Utils} from '../utils';
import {Utils as OAuth2Utils} from "oauth2";

if (process.argv.length < 3) {
    console.error("config file is missiing");
    process.exit(1);
}
let configFile = process.argv[2];
let config: IAppConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

// initialize AWS
if (config.awsConfig.credentialProfile) AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: config.awsConfig.credentialProfile});
AWS.config.update({region: config.awsConfig.region});

let store = new SettingsStore(config.settingsFile);

store.load()
.then((options: ImplementationJSON) => {
    console.log("settings loaded successfully. settings=");
    console.log(JSON.stringify(options, null, 2));
    console.log("");

    let app = express();

    app.use(noCache);
    app.use(bodyParser.json({"limit":"999mb"}));
    app.use(prettyPrinter.get());
    app.set('jsonp callback name', 'cb');

    // add access authorization middleware to the root
    app.use('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!config.allowedAccessTokens || config.allowedAccessTokens.length === 0)
            next();
        else {
            let not_authorized_err = {error: "not-authorized"};
            let authHeader: string = req.headers["authorization"];
            if (!authHeader)
                res.status(400).json(not_authorized_err);
            else {
                let tokenMatched = false;
                for (let i in config.allowedAccessTokens) {
                    let accessToken = config.allowedAccessTokens[i];
                    if (OAuth2Utils.getAuthorizationHeaderFormAccessToken(accessToken) === authHeader) {
                        tokenMatched = true;
                        break;
                    }
                }
                if (tokenMatched)
                    next();
                else
                    res.status(400).json(not_authorized_err);
            }
        }
    });

    let implementation = new EC2Implementation(
        config.implementationInfo
        ,(worker: IWorker) => worker.RemoteAddress
        ,(instance: EC2.Instance) => (instance ? instance.PrivateIpAddress : null)
        ,(instance: EC2.Instance, workerKey: WorkerKey) => (instance ? instance.PrivateIpAddress === workerKey : false)
        ,options);

    implementation.on('change', () => {
        let msg: GridMessage = {type: "change", content: null};
        connectionsManager.dispatchMessage(Utils.getImplementationSetupTopic(), {}, msg);

        store.save(implementation.toJSON())
        .then(() => {}).catch((err: any) => {
            console.error("!!! Error saving settings: " + JSON.stringify(err));
        });
    });

    let g: IGlobal = {implementation};
    app.set("global", g);

    app.use('/services', servicesRouter);

    startServer(config.webServerConfig, app, (secure:boolean, host:string, port:number) => {
        console.log('aws ec2 auto-scaler impl. service listening at %s://%s:%s', (secure ? 'https' : 'http'), host, port);
    });
}).catch((err: any) => {
    console.error("!! Error loading settings: " + JSON.stringify(err));
    process.exit(1);
});

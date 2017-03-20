import {IWebServerConfig} from 'express-web-server';
import {AutoScalerImplementationInfo} from 'autoscalable-grid';
import {AccessToken} from "oauth2";

export interface ASWConfig {
    credentialProfile: string;
    region: string;
}

export interface IAppConfig {
    webServerConfig: IWebServerConfig;
    awsConfig: ASWConfig;
    allowedAccessTokens?: AccessToken[];
    implementationInfo: AutoScalerImplementationInfo;
    settingsFile: string;
}
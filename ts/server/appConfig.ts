import {IWebServerConfig} from 'express-web-server';
import {AutoScalerImplementationInfo} from 'autoscalable-grid';

export interface ASWConfig {
    credentialProfile: string;
    region: string;
}

export interface IAppConfig {
    webServerConfig: IWebServerConfig;
    awsConfig: ASWConfig;
    implementationInfo: AutoScalerImplementationInfo;
    settingsFile: string;
}
import { IWebServerConfig } from 'express-web-server';
import { AutoScalerImplementationInfo } from 'autoscalable-grid';
export interface IAppConfig {
    webServerConfig: IWebServerConfig;
    awsProfile: string;
    implementationInfo: AutoScalerImplementationInfo;
    settingsFile: string;
}

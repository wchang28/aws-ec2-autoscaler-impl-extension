import { IWebServerConfig } from 'express-web-server';
import { AutoScalerImplementationInfo } from 'autoscalable-grid';
export interface IAppConfig {
    webServerConfig: IWebServerConfig;
    implementationInfo: AutoScalerImplementationInfo;
    settingsFile: string;
}

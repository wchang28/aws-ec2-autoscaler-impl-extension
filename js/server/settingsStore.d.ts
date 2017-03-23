import { ImplementationJSON } from "aws-ec2-autoscaler-impl";
export declare class SettingsStore {
    private settingsFile;
    constructor(settingsFile: string);
    load(): Promise<ImplementationJSON>;
    save(settings: ImplementationJSON): Promise<any>;
}

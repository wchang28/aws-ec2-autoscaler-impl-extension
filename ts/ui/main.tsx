import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {GridClient, GridMessage, ApiCore, IMessageClient} from 'grid-client-browser';
import {IImplementation, getImplementation} from '../implApi';
import {ImplementationJSON} from "aws-ec2-autoscaler-impl";

let implApiCore = GridClient.getSession().AutoScalerImplementationApiCore;
let impl = getImplementation(implApiCore);

interface ImplAppProps {
    implementation: IImplementation;
    apiCore: ApiCore<GridMessage>;
}

interface ImplAppState {
    conn_id?: string;
    sub_id?: string;
    setup?: ImplementationJSON
}

class ImplApp extends React.Component<ImplAppProps, ImplAppState> {
    private msgClient: IMessageClient<GridMessage>;
    constructor(props:ImplAppProps) {
        super(props);
        this.msgClient = null;
        this.state = {conn_id: null, sub_id: null, setup: null};
    }
    get Implementation(): IImplementation {return this.props.implementation;}
    get Setup() : ImplementationJSON {return this.state.setup;}
    componentDidMount() {
        console.log('componentDidMount()')
        this.Implementation.Setup.toJSON()
        .then((setup: ImplementationJSON) => {
            this.setState({setup});
        }).catch((err: any) => {
            console.error('!!! error:' + JSON.stringify(err));
        });
        this.msgClient = this.props.apiCore.$M();
        this.msgClient.on('connect', (conn_id:string) => {
            console.log('connected to the dispatcher: conn_id=' + conn_id);
            this.setState({conn_id});
            this.msgClient.subscribe("/", (msg: GridMessage) => {
                //console.log("got a change message");
                this.Implementation.Setup.toJSON()
                .then((setup: ImplementationJSON) => {
                    this.setState({setup});
                }).catch((err: any) => {
                    console.error('!!! error:' + JSON.stringify(err));
                });
            }, {})
            .then((sub_id: string) => {
                console.log("topic subscription is successful. sub_id=" + sub_id);
                this.setState({sub_id});
            }).catch((err: any) => {
                console.error('!!! subscription error:' + JSON.stringify(err));
                this.setState({sub_id: null});
            });
        }).on('error', (err: any) => {
            console.error('!!! connection error:' + JSON.stringify(err));
            this.setState({conn_id: null});
        });
    }
    componentWillUnmount() {
        console.log('componentWillUnmount()');
        this.msgClient.disconnect();
        this.msgClient = null;
    }
    get CanChangeField(): boolean {return (this.Setup? true: false);}

    private getNumericFieldChangeButtonClickHandler(fieldLabel: string, currentValue: number, fieldIsFloat: boolean, setValueProc: (value: number) => Promise<number>) : (e: React.MouseEvent<HTMLButtonElement>) => void {
        let handler = (e: React.MouseEvent<HTMLButtonElement>) => {
            let s = prompt("New " + fieldLabel + ":", currentValue.toString());
            if (s !== null) {
                s = s.trim();
                if (s) {
                    let value = (fieldIsFloat ? parseFloat(s) : parseInt(s));
                    if (isNaN(value))
                        alert("input is not a valid number");
                    else {
                        let p: Promise<number> = setValueProc(value)
                        p.then((value: number) => {
                            console.log("value set="+ JSON.stringify(value));
                        }).catch((err: any) => {
                            console.error('!!! Unable set field auto-scaler: ' + JSON.stringify(err));
                        });
                    }
                }
            }
            e.preventDefault();
        };
        return handler.bind(this);
    }

    private getTextFieldChangeButtonClickHandler(fieldLabel: string, currentValue: string, setValueProc: (value: string) => Promise<string>, nullable: boolean = false) : (e: React.MouseEvent<HTMLButtonElement>) => void {
        let handler = (e: React.MouseEvent<HTMLButtonElement>) => {
            let s = prompt("New " + fieldLabel + ":", currentValue);
            if (s !== null) {
                s = s.trim();
                let setValue = (nullable || (s ? true : false));
                if (setValue) {
                    let p: Promise<string> = setValueProc(s)
                    p.then((value: string) => {
                        console.log("value set="+ JSON.stringify(value));
                    }).catch((err: any) => {
                        console.error('!!! Unable set field auto-scaler: ' + JSON.stringify(err));
                    });
                }
            }
            e.preventDefault();
        };
        return handler.bind(this);
    }
    render() {
        let style = {"width":"33%"};
        return (
            <div style={style}>
                <div className="w3-card-4 w3-margin">
                    <div className="w3-container w3-blue">
                        <h6>Setup</h6>
                    </div>
                    <div className="w3-container w3-white">
                        <table className="w3-table w3-bordered w3-small w3-centered">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>CPUs Per Instance</td>
                                    <td>{this.Setup ? this.Setup.CPUsPerInstance.toString() : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getNumericFieldChangeButtonClickHandler("CPUs Per Instance", (this.Setup ? this.Setup.CPUsPerInstance : null), false, this.Implementation.Setup.setCPUsPerInstance.bind(this.Implementation.Setup))}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Key Name</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.KeyName : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("Key Name", (this.Setup ? this.Setup.WorkerCharacteristic.KeyName : null), this.Implementation.Setup.WorkerCharacteristic.setKeyName.bind(this.Implementation.Setup.WorkerCharacteristic))}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Instance Type</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.InstanceType : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("Instance Type", (this.Setup ? this.Setup.WorkerCharacteristic.InstanceType : null), this.Implementation.Setup.WorkerCharacteristic.setInstanceType.bind(this.Implementation.Setup.WorkerCharacteristic))}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Image Id</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.ImageId : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("Image Id", (this.Setup ? this.Setup.WorkerCharacteristic.ImageId : null), this.Implementation.Setup.WorkerCharacteristic.setImageId.bind(this.Implementation.Setup.WorkerCharacteristic))}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Security Group Id</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.SecurityGroupId : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("Security Group Id", (this.Setup ? this.Setup.WorkerCharacteristic.SecurityGroupId : null), this.Implementation.Setup.WorkerCharacteristic.setSecurityGroupId.bind(this.Implementation.Setup.WorkerCharacteristic))}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Subnet Id</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.SubnetId : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("Subnet Id", (this.Setup ? this.Setup.WorkerCharacteristic.SubnetId : null), this.Implementation.Setup.WorkerCharacteristic.setSubnetId.bind(this.Implementation.Setup.WorkerCharacteristic))}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>IAM Role Name</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.IAMRoleName : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("IAM Role Name", (this.Setup ? this.Setup.WorkerCharacteristic.IAMRoleName : null), this.Implementation.Setup.WorkerCharacteristic.setIAMRoleName.bind(this.Implementation.Setup.WorkerCharacteristic), true)}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Name Tag</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.NameTag : null}</td>
                                    <td><button disabled={!this.CanChangeField} onClick={this.getTextFieldChangeButtonClickHandler("Name Tag", (this.Setup ? this.Setup.WorkerCharacteristic.NameTag : null), this.Implementation.Setup.WorkerCharacteristic.setNameTag.bind(this.Implementation.Setup.WorkerCharacteristic), true)}>Change...</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<ImplApp implementation={impl} apiCore={implApiCore}/>, document.getElementById('main'));
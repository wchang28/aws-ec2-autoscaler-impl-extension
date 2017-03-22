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
                                    <td><button disabled={!this.CanChangeField}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>KeyName</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.KeyName : null}</td>
                                    <td><button disabled={!this.CanChangeField}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Instance Type</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.InstanceType : null}</td>
                                    <td><button disabled={!this.CanChangeField}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Image Id</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.ImageId : null}</td>
                                    <td><button disabled={!this.CanChangeField}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Security Group Id</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.SecurityGroupId : null}</td>
                                    <td><button disabled={!this.CanChangeField}>Change...</button></td>
                                </tr>
                                <tr>
                                    <td>Subnet Id</td>
                                    <td>{this.Setup ? this.Setup.WorkerCharacteristic.SubnetId : null}</td>
                                    <td><button disabled={!this.CanChangeField}>Change...</button></td>
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
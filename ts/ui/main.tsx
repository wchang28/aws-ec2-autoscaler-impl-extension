
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
    render() {
        return <div>{this.state.setup ? JSON.stringify(this.state.setup, null, 2) : "???"}</div>;
    }
}

ReactDOM.render(<ImplApp implementation={impl} apiCore={implApiCore}/>, document.getElementById('main'));
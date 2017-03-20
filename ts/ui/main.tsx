import {GridClient, GridMessage} from 'grid-client-browser';
import {IImplementation, getImplementation} from '../implApi';

let implApiCore = GridClient.getSession().AutoScalerImplementationApiCore;
implApiCore.$M().subscribe("/", (msg: GridMessage) => {

});
let impl = getImplementation(implApiCore);
//impl.Setup.toJSON()
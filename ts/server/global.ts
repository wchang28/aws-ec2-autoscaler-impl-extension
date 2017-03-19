import {Implementation as EC2Implementation} from "aws-ec2-autoscaler-impl";

export interface IGlobal {
    implementation: EC2Implementation;
}
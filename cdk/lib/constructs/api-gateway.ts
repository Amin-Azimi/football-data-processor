import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface FootballApiProps {
    dataIngestionLambda: lambda.IFunction;
}

export class FootballAnalyticsApi extends Construct {
    public  api: apiGateway.RestApi;

    constructor(scope: Construct, id: string, props: FootballApiProps) {
        super(scope, id);
        this.api = new apiGateway.RestApi(this, 'FootballAnalyticsApi', {
            restApiName: 'Football Analytics Service',
            description: 'API for football match analytics',
        });
        
        const ingestResource = this.api.root.addResource('ingest');
        ingestResource.addMethod('POST', new apiGateway.LambdaIntegration(props.dataIngestionLambda));
    }
}
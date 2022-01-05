# Web DEXTF Ðapp Deployment

- SES: verify domain
- SES: move out of Sandbox

Gateway API permissions :
aws lambda add-permission --function-name "arn:aws:lambda:ap-southeast-1:466153871126:function:companies" --source-arn "arn:aws:execute-api:ap-southeast-1:466153871126:f3ndsl27t3/\*/GET/**companies**" --principal apigateway.amazonaws.com --statement-id 2ecd95b8-c78e-4544-84e6-847015b44841 --action lambda:InvokeFunction

aws lambda add-permission --function-name "arn:aws:lambda:ap-southeast-1:466153871126:function:**companies:test**" --source-arn "arn:aws:execute-api:ap-southeast-1:466153871126:f3ndsl27t3/\*/GET/companies" --principal apigateway.amazonaws.com --statement-id 2ecd95b8-c78e-4544-84e6-847015b44841 --action lambda:InvokeFunction

aws lambda add-permission --function-name "arn:aws:lambda:ap-southeast-1:466153871126:function:**companies:prod**" --source-arn "arn:aws:execute-api:ap-southeast-1:466153871126:f3ndsl27t3/\*/GET/companies" --principal apigateway.amazonaws.com --statement-id 2ecd95b8-c78e-4544-84e6-847015b44841 --action lambda:InvokeFunction

To upload static data to DynamoDB
aws dynamodb batch-write-item --request-items file://dynamoDbAssets_batch01.json

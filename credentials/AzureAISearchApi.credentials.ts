import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AzureAISearchApi implements ICredentialType {
	name = 'azureAISearchApi';
	displayName = 'Azure AI Search API';
	properties: INodeProperties[] = [
		{
			displayName: 'Endpoint',
			name: 'endpoint',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
}

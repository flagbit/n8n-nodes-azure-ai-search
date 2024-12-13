import { AzureAISearchVectorStore } from "@langchain/community/vectorstores/azure_aisearch";
import type { INodeProperties } from 'n8n-workflow';
import { createVectorStoreNode } from '../shared/createVectorStoreNode';
import { metadataFilterField } from '../../../utils/sharedFields';

const sharedFields: INodeProperties[] = [
	{
		displayName: 'Index Name',
		name: 'indexName',
		type: 'string',
		default: 'vectors',
		description: 'The Azure AI Search index name to store the vectors in',
	},
];

const insertFields: INodeProperties[] = [
	{
		displayName: 'Documents',
		name: 'documents',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Document',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'documentValues',
				displayName: 'Document',
				values: [
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						description: 'Text to be vectorized and stored',
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						type: 'json',
						default: '{}',
						description: 'Metadata to store with the document',
					},
				],
			},
		],
	},
];

const retrieveFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'The text to find similar documents to',
	},
	metadataFilterField,
];

// ... existing field definitions can be reused ...

export const VectorStoreAzureAISearch = createVectorStoreNode({
	meta: {
		description: 'Work with your data in Azure AI Search for vector-based search',
		icon: 'file:azure.svg',
		displayName: 'Azure AI Search Vector Store',
		name: 'vectorStoreAzureAISearch',
		credentials: [{ name: 'azureAISearchApi', required: true }],
		docsUrl: 'https://docs.n8n.io/...',
	},
	sharedFields,
	insertFields,
	loadFields: retrieveFields,
	retrieveFields,
	async getVectorStoreClient(context, filter, embeddings, itemIndex) {
		const indexName = context.getNodeParameter('indexName', itemIndex, '', {
			extractValue: true,
		}) as string;

		const credentials = await context.getCredentials('azureAISearchApi');

		const config = {
			endpoint: String(credentials.endpoint),
			key: String(credentials.apiKey),
			indexName,
		};

		return new AzureAISearchVectorStore(embeddings, config);
	},
	async populateVectorStore(context, embeddings, documents, itemIndex) {
		const indexName = context.getNodeParameter('indexName', itemIndex, '', {
			extractValue: true,
		}) as string;

		const credentials = await context.getCredentials('azureAISearchApi');

		const config = {
			endpoint: String(credentials.endpoint),
			key: String(credentials.apiKey),
			indexName,
		};

		await AzureAISearchVectorStore.fromDocuments(documents, embeddings, config);
	},
});

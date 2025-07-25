import { AzureAISearchVectorStore } from "@langchain/community/vectorstores/azure_aisearch";
import type { INodeProperties } from 'n8n-workflow';
import { createVectorStoreNode } from '../shared/createVectorStoreNode';
import { metadataFilterField } from '../../../utils/sharedFields';
import { getAzureAISearchFilters } from '../../../utils/helpers';

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
	{
		displayName: 'Filter Mode',
		name: 'filterMode',
		type: 'options',
		noDataExpression: true,
		default: 'metadata',
		options: [
			{
				name: 'Metadata Fields',
				value: 'metadata',
				description: 'Use metadata key-value pairs for filtering',
			},
			{
				name: 'Custom OData Filter',
				value: 'custom',
				description: 'Provide a custom OData filter expression',
			},
		],
		description: 'Choose how to specify the filter for the search',
	},
	{
		...metadataFilterField,
		displayOptions: {
			show: {
				filterMode: ['metadata'],
			},
		},
	},
	{
		displayName: 'Custom Filter Expression',
		name: 'customFilter',
		type: 'string',
		default: '',
		placeholder: "metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'technology')",
		description: 'Azure AI Search OData filter expression. Example: metadata/source eq \'document.pdf\' or metadata/attributes/any(attr: attr/key eq \'category\' and attr/value eq \'technology\').',
		displayOptions: {
			show: {
				filterMode: ['custom'],
			},
		},
	},
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

		// Create the vector store instance
		const vectorStore = new AzureAISearchVectorStore(embeddings, config);

		// Convert n8n filters to Azure AI Search format and override search methods
		const originalSimilaritySearchVectorWithScore = vectorStore.similaritySearchVectorWithScore.bind(vectorStore);
		const originalHybridSearchVectorWithScore = vectorStore.hybridSearchVectorWithScore?.bind(vectorStore);
		const originalSemanticHybridSearchVectorWithScore = vectorStore.semanticHybridSearchVectorWithScore?.bind(vectorStore);

		vectorStore.similaritySearchVectorWithScore = async (query: number[], k: number, _filter?: any) => {
			// Get Azure AI Search specific filter
			const azureFilter = getAzureAISearchFilters(context, itemIndex);
			return originalSimilaritySearchVectorWithScore(query, k, azureFilter);
		};

		// Override hybrid search method if it exists
		if (originalHybridSearchVectorWithScore) {
			vectorStore.hybridSearchVectorWithScore = async (query: string, queryVector?: number[], k: number = 4, _filter?: any) => {
				const azureFilter = getAzureAISearchFilters(context, itemIndex);
				return originalHybridSearchVectorWithScore(query, queryVector, k, azureFilter);
			};
		}

		// Override semantic hybrid search method if it exists
		if (originalSemanticHybridSearchVectorWithScore) {
			vectorStore.semanticHybridSearchVectorWithScore = async (query: string, queryVector?: number[], k: number = 4, _filter?: any) => {
				const azureFilter = getAzureAISearchFilters(context, itemIndex);
				return originalSemanticHybridSearchVectorWithScore(query, queryVector, k, azureFilter);
			};
		}

		return vectorStore;
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

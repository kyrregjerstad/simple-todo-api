export const openAPISpec = {
	openapi: '3.0.0',
	info: {
		title: 'Todo API',
		version: '1.0.0',
		description:
			'API for managing todos and user-specific todos. This API is a simple example of a RESTful API with CRUD operations, built with Hono, Drizzle, Zod and Cloudflare worker. It resets every 24 hours.',
	},
	paths: {
		'/todos': {
			get: {
				summary: 'Get all todos',
				description: 'Fetch all todos, optionally filtered by completion status.',
				parameters: [
					{
						in: 'query',
						name: 'completed',
						schema: {
							type: 'string',
							enum: ['true', 'false'],
						},
						description: 'Filter todos by completion status.',
					},
				],
				responses: {
					'200': {
						description: 'A list of todos.',
						content: {
							'application/json': {
								schema: {
									type: 'array',
									items: {
										$ref: '#/components/schemas/Todo',
									},
								},
							},
						},
					},
					'400': {
						description: 'Error in fetching todos.',
					},
				},
			},
		},
		'/todos/{todoId}': {
			get: {
				summary: 'Get a single todo',
				description: 'Fetch a single todo by its ID.',
				parameters: [
					{
						in: 'path',
						name: 'todoId',
						required: true,
						schema: {
							type: 'string',
						},
						description: 'The ID of the todo to fetch.',
					},
				],
				responses: {
					'200': {
						description: 'A single todo.',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/Todo',
								},
							},
						},
					},
					'404': {
						description: 'Todo not found.',
					},
				},
			},
			patch: {
				summary: 'Update a todo',
				description: 'Update an existing todo by its ID.',
				parameters: [
					{
						in: 'path',
						name: 'todoId',
						required: true,
						schema: {
							type: 'string',
						},
						description: 'The ID of the todo to update.',
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Todo',
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Updated todo.',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/Todo',
								},
							},
						},
					},
					'400': {
						description: 'Invalid todo data.',
					},
					'500': {
						description: 'Failed to update todo.',
					},
				},
			},
			delete: {
				summary: 'Delete a todo',
				description: 'Delete a todo by its ID.',
				parameters: [
					{
						in: 'path',
						name: 'todoId',
						required: true,
						schema: {
							type: 'string',
						},
						description: 'The ID of the todo to delete.',
					},
				],
				responses: {
					'204': {
						description: 'Todo successfully deleted, no content to return.',
					},
					'400': {
						description: 'Todo ID is required.',
					},
					'404': {
						description: 'Todo not found.',
					},
				},
			},
			'/todos/{todoId}/complete': {
				patch: {
					summary: 'Mark todo as complete',
					description: 'Mark a todo as complete by its ID.',
					parameters: [
						{
							in: 'path',
							name: 'todoId',
							required: true,
							schema: {
								type: 'string',
							},
							description: 'The ID of the todo to mark as complete.',
						},
					],
					responses: {
						'200': {
							description: 'Todo marked as complete.',
							content: {
								'application/json': {
									schema: {
										$ref: '#/components/schemas/Todo',
									},
								},
							},
						},
						'404': {
							description: 'Todo not found.',
						},
					},
				},
			},
		},
		'/users/{userId}/todos': {
			get: {
				summary: 'Get user-specific todos',
				description: 'Fetch all todos for a specific user, optionally filtered by completion status.',
				parameters: [
					{
						in: 'path',
						name: 'userId',
						required: true,
						schema: {
							type: 'string',
						},
						description: 'The ID of the user to fetch todos for.',
					},
					{
						in: 'query',
						name: 'completed',
						schema: {
							type: 'string',
							enum: ['true', 'false'],
						},
						description: 'Filter todos by completion status.',
					},
				],
				responses: {
					'200': {
						description: 'A list of todos.',
						content: {
							'application/json': {
								schema: {
									type: 'array',
									items: {
										$ref: '#/components/schemas/Todo',
									},
								},
							},
						},
					},
					'400': {
						description: 'Error in fetching todos.',
					},
				},
			},
			post: {
				summary: 'Create a new todo',
				description: 'Create a new todo for a specific user.',
				parameters: [
					{
						in: 'path',
						name: 'userId',
						required: true,
						schema: {
							type: 'string',
						},
						description: 'The ID of the user to create a todo for.',
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Todo',
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Created todo.',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/Todo',
								},
							},
						},
					},
					'400': {
						description: 'Invalid todo data.',
					},
					'500': {
						description: 'Failed to create todo.',
					},
				},
			},
		},
	},
	components: {
		schemas: {
			Todo: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
					},
					name: {
						type: 'string',
					},
					description: {
						type: 'string',
					},
					userId: {
						type: 'string',
					},
					completed: {
						type: 'boolean',
					},
				},
				required: ['id', 'name'],
			},
		},
	},
};

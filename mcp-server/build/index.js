import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_todos",
                description: "Get all todos",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "create_todo",
                description: "Create a todo",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                    },
                    required: ["title"],
                },
            },
            {
                name: "update_todo",
                description: "Update a todo",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        title: { type: "string" },
                    },
                    required: ["id", "title"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_todos") {
        const response = await fetch("http://localhost:3000/todos");
        const todos = await response.json();
        return { toolResult: { todos } };
    }
    if (request.params.name === "create_todo") {
        const { title } = request.params.arguments;
        if (!title) {
            throw new McpError(ErrorCode.InvalidParams, "Input is required");
        }
        const response = await fetch("http://localhost:3000/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
            }),
        });
        const todo = await response.json();
        return { toolResult: { todo } };
    }
    if (request.params.name === "update_todo") {
        const input = request.params.arguments;
        if (!input?.id || !input?.title) {
            throw new McpError(ErrorCode.InvalidParams, "Input is required");
        }
        const response = await fetch(`http://localhost:3000/todos/${input.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
        const todo = await response.json();
        return { toolResult: { todo } };
    }
    throw new McpError(ErrorCode.InternalError, "Tool not found");
});
const transport = new StdioServerTransport();
await server.connect(transport);

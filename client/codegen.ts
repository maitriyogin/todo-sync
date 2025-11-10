import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "../server/src/schema.ts",
	documents: ["./src/**/*.graphql"],
	generates: {
		"src/api/generated.ts": {
			plugins: [
				"typescript",
				"typescript-resolvers",
				"typescript-operations",
				"typed-document-node",
			],
			config: {
				exportHooks: true,
			},
		},
	},
	require: ["ts-node/register/transpile-only"],
};
export default config;

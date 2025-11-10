// A mock sync service. In real life, this wraps fetch/axios calls.
// It throws when the navigator is offline to simulate network failure.
import { client } from "../api/grapqhl-api";
export interface SyncServiceProps {
	query: string;
	variables?: any;
}
export const syncService = {
	async send(op) {
		// simulate network latency
		// await new Promise((res) => setTimeout(res, 300));
		console.log("[syncService] sending op", op);
		const res = await client.request({
			document: op.query,
			variables: op.variables,
		});
		// simulate offline by checking navigator.onLine
		if (typeof navigator !== "undefined" && !navigator.onLine) {
			throw new Error("Network offline");
		}
		// here you'd call your API; we simulate success
		console.log("[syncService] sent op", op);
		return { ok: true, ...res };
	},
};

import { v4 as uuidv4 } from "uuid";

// The node:crypto version is not supported in the browser.
// Use the uuid package instead.
export function randomUUID(): string {
	return uuidv4();
}

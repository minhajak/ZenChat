import xss from "xss";

export const sanitizeInput = (input: any): any => {
	if (typeof input === "string") return xss(input);

	if (Array.isArray(input)) return input.map(sanitizeInput);

	if (typeof input === "object" && input !== null) {
		const sanitized: any = {};
		for (const key in input) {
			sanitized[key] = sanitizeInput(input[key]);
		}
		return sanitized;
	}

	return input;
};
export function sanitizeDate(input: unknown): Date | undefined {
	if (input == null) return undefined;
	const d = new Date(String(input));
	return isNaN(d.getTime()) ? undefined : d;
}

/** Validate URL using the URL constructor. Returns normalized URL string or undefined */
export function sanitizeURL(input: unknown): string | undefined {
	if (typeof input !== "string" || !input.trim()) return undefined;
	try {
		const u = new URL(input.trim());
		return u.toString();
	} catch {
		return undefined;
	}
}
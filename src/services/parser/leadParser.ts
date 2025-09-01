import { z } from "zod";

export type Lead = {
	name?: string | undefined;
	email?: string | undefined;
	phone?: string | undefined;
	company?: string | undefined;
	job_title?: string | undefined;
	website?: string | undefined;
	source?: string | undefined;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phoneDigits = /[\d+]/g;
const urlRegex = /\b((https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?\b/;

const leadSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().regex(emailRegex).optional(),
	phone: z.string().min(7).optional(),
	company: z.string().min(1).optional(),
	job_title: z.string().min(1).optional(),
	website: z.string().min(1).optional(),
	source: z.string().min(1).optional(),
});

export function normalizePhone(raw?: string): string | undefined {
	if (!raw) return undefined;
	const digits = (raw.match(phoneDigits) || []).join("");
	if (!digits) return undefined;
	if (raw.trim().startsWith("+") && !digits.startsWith("+")) {
		return `+${digits}`;
	}
	return digits;
}

export function normalizeWebsite(raw?: string): string | undefined {
	if (!raw) return undefined;
	let v = raw.trim().toLowerCase();
	if (v.startsWith("www.")) v = v.slice(4);
	if (v.startsWith("http://")) v = v.slice(7);
	if (v.startsWith("https://")) v = v.slice(8);
	return v.replace(/\/$/, "");
}

export function parseLeadFromText(text: string): Lead {
	const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	const joined = lines.join(" ");

	const emailMatch = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
	const urlMatch = joined.match(urlRegex);
	const phoneMatch = joined.match(/(\+?\d[\s-.()]*){7,}/g);

	let name: string | undefined;
	let company: string | undefined;
	let jobTitle: string | undefined;

	const top = lines.slice(0, 5);
	if (top.length) {
		name = top[0];
		if (top[1]) jobTitle = top[1];
		if (top[2]) company = top[2];
	}

	const lead: Lead = {
		name,
		email: emailMatch ? emailMatch[0] : undefined,
		phone: normalizePhone(phoneMatch ? phoneMatch[0] : undefined),
		company,
		job_title: jobTitle,
		website: normalizeWebsite(urlMatch ? urlMatch[1] : undefined),
	};

	const res = leadSchema.safeParse(lead);
	if (!res.success) {
		return lead;
	}
	return res.data;
}


import { query } from "./client";
import { Lead } from "../services/parser/leadParser";

export async function upsertLead(lead: Lead) {
	const result = await query(
		`INSERT INTO leads (name, email, phone, company, job_title, website, source)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 ON CONFLICT (email) DO UPDATE SET
		   name = COALESCE(EXCLUDED.name, leads.name),
		   phone = COALESCE(EXCLUDED.phone, leads.phone),
		   company = COALESCE(EXCLUDED.company, leads.company),
		   job_title = COALESCE(EXCLUDED.job_title, leads.job_title),
		   website = COALESCE(EXCLUDED.website, leads.website),
		   source = COALESCE(EXCLUDED.source, leads.source)
		 RETURNING *`,
		[
			lead.name ?? null,
			lead.email ?? null,
			lead.phone ?? null,
			lead.company ?? null,
			lead.job_title ?? null,
			lead.website ?? null,
			lead.source ?? null,
		]
	);
	return result.rows[0];
}


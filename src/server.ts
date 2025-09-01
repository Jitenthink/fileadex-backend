import express from "express";
import { json } from "express";
import { env } from "./config/env";
import { crmRouter } from "./routes/crm";
import { extractTextFromImage } from "./services/ocr/googleVision";
import { parseLeadFromText } from "./services/parser/leadParser";
import { upsertLead } from "./db/leadsRepo";
import { pushToCrm } from "./services/crmClient";

const app = express();
app.use(json({ limit: "2mb" }));

app.use(crmRouter);

app.post("/ingest-local", async (req, res) => {
	try {
		const { imagePath } = req.body || {};
		if (!imagePath) return res.status(400).json({ error: "imagePath required" });

		const ocrText = await extractTextFromImage(imagePath);
		console.log("OCR text:\n", ocrText);

		const lead = parseLeadFromText(ocrText);
		lead.source = `Google Vision - ${new Date().toISOString()}`;

		const saved = await upsertLead(lead);
		await pushToCrm(`http://localhost:${env.port}`, saved);

		return res.json({ saved, synced: true });
	} catch (err) {
		console.error("/ingest-local error", err);
		return res.status(500).json({ error: "Internal error" });
	}
});

app.listen(env.port, () => {
	console.log(`Server listening on http://localhost:${env.port}`);
});


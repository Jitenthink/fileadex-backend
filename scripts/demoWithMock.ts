import path from "path";
import { extractTextFromImage } from "../src/services/ocr/googleVision";
import { parseLeadFromText } from "../src/services/parser/leadParser";
import { upsertLead } from "../src/db/leadsRepo";
import { pushToCrm } from "../src/services/crmClient";
import { env } from "../src/config/env";

function getArgFlag(flag: string): boolean {
	return process.argv.includes(flag);
}

async function run() {
	const imagePath = process.argv[2];
	if (!imagePath) {
		console.error("Usage: npm run demo:mock -- /abs/path/to/business-card.jpg [--real-ocr]");
		console.error("  --real-ocr: Use actual Google Vision API (requires valid credentials)");
		console.error("  Default: Uses mock OCR data based on the business card image");
		process.exit(1);
	}

	const useRealOCR = getArgFlag("--real-ocr");

	console.log("\n=== Fileadex Pipeline Demo ===");
	console.log(`📇 Business card image: ${path.resolve(imagePath)}`);
	console.log(useRealOCR ? "(Using Google Vision API)" : "(Using Mock OCR)");

	// 1) OCR
	console.log(`\n[1/4] 🔎 OCR: Extracting text${useRealOCR ? " with Google Vision" : " (mock)"}...`);
	let ocrText = "";
	
	if (useRealOCR) {
		try {
			ocrText = await extractTextFromImage(imagePath);
		} catch (error: any) {
			console.error("❌ Google Vision API failed:", error.message);
			console.log("💡 Tip: Use without --real-ocr flag for mock demo, or fix Google credentials");
			process.exit(1);
		}
	} else {
		// Mock OCR data based on the provided business card
		ocrText = [
			"Olivia Wilson",
			"Real Estate Agent",
			"+123-456-7890",
			"+123-456-7890", 
			"www.reallygreatsite.com",
			"hello@reallygreatsite.com",
			"123 Anywhere St.,",
			"Any City, ST 12345",
		].join("\n");
	}
	
	console.log("\n--- OCR Output ---\n" + (ocrText || "<no text detected>") + "\n-------------------\n");

	// 2) Parse & normalize
	console.log("[2/4] 🧹 Parsing & normalizing lead fields...");
	const lead = parseLeadFromText(ocrText || "");
	lead.source = `${useRealOCR ? "Google Vision" : "Mock OCR"} - ${new Date().toISOString()}`;
	console.log("Parsed lead:");
	console.log(JSON.stringify(lead, null, 2));

	// 3) Store in Postgres
	console.log("\n[3/4] 🗄️  Upserting lead into Postgres (table: leads)...");
	const saved = await upsertLead(lead);
	console.log("Saved lead row:");
	console.log(JSON.stringify(saved, null, 2));

	// 4) CRM sync
	console.log("\n[4/4] 🔗 Triggering CRM sync (POST /crm-sync)...");
	try {
		const crmBase = `http://localhost:${env.port}`;
		const crmResponse = await pushToCrm(crmBase, saved);
		console.log("CRM response:");
		console.log(JSON.stringify(crmResponse, null, 2));
		console.log("\n✅ Pipeline completed successfully!");
		console.log("\n📊 Summary:");
		console.log("1. ✅ Business Card Image → OCR Text Extraction");
		console.log("2. ✅ OCR Text → Parsed & Normalized Lead Data");
		console.log("3. ✅ Lead Data → Stored in PostgreSQL Database");
		console.log("4. ✅ Database Record → Synced to CRM Endpoint");
	} catch (err: any) {
		console.error("⚠️  CRM sync failed after retry. Error:", err?.message || err);
		console.log("\n✅ Data stored in Postgres, but CRM sync failed.");
	}
}

run().catch((err) => {
	console.error("❌ Demo failed:", err);
	process.exit(1);
});

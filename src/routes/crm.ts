import { Router } from "express";

export const crmRouter = Router();

crmRouter.post("/crm-sync", async (req, res) => {
	try {
		const payload = req.body;
		if (!payload || typeof payload !== "object") {
			return res.status(400).json({ error: "Invalid payload" });
		}
		console.log("[CRM] Received payload", payload);
		return res.json({ status: "ok" });
	} catch (err) {
		console.error("[CRM] Error handling request", err);
		return res.status(500).json({ error: "Internal error" });
	}
});


import axios from "axios";

export async function pushToCrm(baseUrl: string, payload: any) {
	const url = `${baseUrl.replace(/\/$/, "")}/crm-sync`;
	try {
		const res = await axios.post(url, payload, { timeout: 5000 });
		return res.data;
	} catch (err) {
		try {
			const res = await axios.post(url, payload, { timeout: 5000 });
			return res.data;
		} catch (err2) {
			console.error("CRM sync failed twice", err2);
			throw err2;
		}
	}
}


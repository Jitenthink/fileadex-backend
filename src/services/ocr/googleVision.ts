import vision, { ImageAnnotatorClient } from "@google-cloud/vision";
import { env } from "../../config/env";

let client: ImageAnnotatorClient | null = null;

function getClient(): ImageAnnotatorClient {
	if (!client) {
		if (!env.googleCredentials) {
			throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set in environment");
		}
		client = new vision.ImageAnnotatorClient({
			keyFilename: env.googleCredentials,
		});
	}
	return client;
}

export async function extractTextFromImage(imagePath: string): Promise<string> {
	try {
		const visionClient = getClient();
		const [result] = await visionClient.textDetection(imagePath);
		const detections = (result && result.textAnnotations) ? result.textAnnotations : [];
		if (!detections || detections.length === 0) return "";
		return detections[0]?.description || "";
	} catch (error: any) {
		if (error.message?.includes("client_email")) {
			throw new Error("Invalid Google Vision credentials. Please use a Service Account key file, not OAuth2 credentials.");
		}
		throw error;
	}
}


import dotenv from "dotenv";

dotenv.config();

export const env = {
	port: parseInt(process.env.PORT || "3000", 10),
	databaseUrl: process.env.DATABASE_URL || "",
	googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
};

if (!env.databaseUrl) {
	console.warn("DATABASE_URL is not set.");
}
if (!env.googleCredentials) {
	console.warn("GOOGLE_APPLICATION_CREDENTIALS is not set.");
}


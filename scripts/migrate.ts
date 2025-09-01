import fs from "fs";
import path from "path";
import { pool } from "../src/db/client";

async function run() {
	const migrationsDir = path.resolve(__dirname, "../migrations");
	const files = fs
		.readdirSync(migrationsDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	for (const file of files) {
		const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
		console.log(`Running migration: ${file}`);
		await pool.query(sql);
	}
	await pool.end();
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});


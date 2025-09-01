import axios from "axios";

async function run() {
	const imagePath = process.argv[2];
	if (!imagePath) {
		console.error("Usage: npm run ingest:local -- /abs/path/to/image.jpg");
		process.exit(1);
	}
	const res = await axios.post("http://localhost:3000/ingest-local", { imagePath });
	console.log(JSON.stringify(res.data, null, 2));
}

run().catch((err) => {
	console.error(err?.response?.data || err.message);
	process.exit(1);
});


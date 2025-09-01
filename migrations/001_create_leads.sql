CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	name TEXT,
	email TEXT UNIQUE,
	phone TEXT,
	company TEXT,
	job_title TEXT,
	website TEXT,
	source TEXT,
	created_at TIMESTAMP DEFAULT NOW()
);


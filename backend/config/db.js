require("dotenv").config();
const pg = require("pg");

// Keep DATE columns as "YYYY-MM-DD" strings instead of timezone-shifted Date objects
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Neon closes idle connections when its compute suspends; an unhandled pool error would crash the server
pool.on("error", (error) => console.error("Idle database client error:", error.message));

module.exports = pool;

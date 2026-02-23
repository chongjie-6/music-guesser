const allowedOrigins = [
  "http://localhost:5173",
  "https://music-guesser-pi.vercel.app",
  "https://music-guesser-production.up.railway.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and authorization headers
};

module.exports = { corsOptions, allowedOrigins };

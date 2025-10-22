export default () => ({
  port: parseInt(process.env.PORT, 10) || 4001,
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || "",
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "REDACTED_JWT_SECRET",
    expiresIn: "24h",
  },
});

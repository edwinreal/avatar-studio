/**
 * Environment validation
 * Ensures all required environment variables are set at startup
 */

const requiredEnvVars = ["JWT_SECRET"];

const optionalEnvVars = [
  "MONGODB_URI",
  "MONGODB_DB",
  "OPENAI_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CORS_ORIGIN",
  "NODE_ENV"
];

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]?.trim()) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const missingList = missing.join(", ");
    throw new Error(
      `Missing required environment variables: ${missingList}\n` +
        `Please check your .env file or copy from .env.example`
    );
  }

  // Log which optional env vars are configured
  const configured = optionalEnvVars.filter((envVar) => process.env[envVar]?.trim());
  if (configured.length > 0) {
    console.log(
      `✓ Optional environment variables configured: ${configured.join(", ")}`
    );
  }

  const notConfigured = optionalEnvVars.filter((envVar) => !process.env[envVar]?.trim());
  if (notConfigured.length > 0) {
    console.warn(
      `⚠ Optional environment variables not configured: ${notConfigured.join(", ")}`
    );
  }
}

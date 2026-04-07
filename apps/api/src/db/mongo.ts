import mongoose from "mongoose";

let hasAttemptedConnection = false;
let isMongoConnected = false;

export const getMongoUri = () => process.env.MONGODB_URI?.trim() ?? "";

export const mongoStatus = () => ({
  enabled: Boolean(getMongoUri()),
  connected: isMongoConnected
});

export const connectToMongo = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    return mongoStatus();
  }

  if (isMongoConnected || mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return mongoStatus();
  }

  if (hasAttemptedConnection && !isMongoConnected) {
    return mongoStatus();
  }

  hasAttemptedConnection = true;

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB?.trim() || "synapse_studios"
    });
    isMongoConnected = true;
  } catch (error) {
    isMongoConnected = false;
    console.warn("MongoDB connection unavailable, using in-memory fallback.", error);
  }

  return mongoStatus();
};

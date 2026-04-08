import "dotenv/config";
import { app } from "./app.js";
import { validateEnv } from "./config.js";
import { connectToMongo } from "./db/mongo.js";

const port = Number(process.env.PORT ?? 4000);

const startServer = async () => {
  try {
    validateEnv();
    const mongo = await connectToMongo();

    app.listen(port, () => {
      console.log(
        `Synapse Studios API running on http://localhost:${port} (mongo connected: ${mongo.connected})`
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[FATAL ERROR]", message);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error("[UNHANDLED ERROR]", error);
  process.exit(1);
});

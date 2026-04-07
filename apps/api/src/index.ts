import "dotenv/config";
import { app } from "./app.js";
import { connectToMongo } from "./db/mongo.js";
const port = Number(process.env.PORT ?? 4000);

const startServer = async () => {
  const mongo = await connectToMongo();

  app.listen(port, () => {
    console.log(
      `Synapse Studios API running on http://localhost:${port} (mongo connected: ${mongo.connected})`
    );
  });
};

void startServer();

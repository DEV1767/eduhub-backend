import "dotenv/config";
import app from "./app.js";
import { connect_db } from "./src/model/db.js";
import { connectRedis } from "./src/config/redis.js"


const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connect_db();

    app.listen(PORT, () => {
      console.log(` Server running on port http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
connectRedis()
import "dotenv/config";
import app from "./app.js";
import { connect_db } from "./src/model/db.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connect_db();   // ✅ wait for DB

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // stop app completely
  }
};

startServer();
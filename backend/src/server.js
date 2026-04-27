require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = parseInt(process.env.PORT || "5000", 10);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

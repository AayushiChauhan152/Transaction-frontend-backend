import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import transaction from "./models/data.js";
import axios from "axios";
import route from "./routes/data.js";

const app = express();
const port = 4000 || process.env.PORT;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/", route);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(bodyParser.json());

// API to initialize the database

app.get("/initialize-database", async (req, res) => {
  try {
    // Fetch data from the third-party API
    const thirdPartyApiUrl =
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
    const response = await axios.get(thirdPartyApiUrl);
    const data = response.data;

    // Initialize the database with seed data
    await transaction.insertMany(data);

    res.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});

// db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB:", process.env.DB_NAME);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

function getDB() {
  if (!db) throw new Error("Database not connected yet. Call connectDB first.");
  return db;
}

module.exports = { connectDB, getDB };

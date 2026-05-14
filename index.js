// index.js
const { connectDB, getDB } = require("./db");

async function main() {
  await connectDB();

  const db = getDB();
  const usersCollection = db.collection("users");

  // Example: Insert a user
  const result = await usersCollection.insertOne({
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date(),
  });

  console.log("Inserted user:", result.insertedId);

  // Example: Fetch users
  const users = await usersCollection.find().toArray();
  console.log("Users:", users);
}

main();

import mongoose from "mongoose";

const connections = {}; // key: DATABASE_URI, value: mongoose.Connection instance

export async function getDbConnection(DATABASE_URI) {
  if (connections[DATABASE_URI]) {
    return connections[DATABASE_URI];
  }

  const conn = await mongoose.createConnection(DATABASE_URI).asPromise();

  connections[DATABASE_URI] = conn;
  return conn;
}

// Seeds the starter catalog into whichever database MONGO_URI points to.
// Safe to run repeatedly: existing products are left untouched, only missing ones are added.
//   npm run seed
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { seedCatalog } from "./seedCatalog.js";

try {
    await connectDB();
    await seedCatalog();
    console.log("Catalog is up to date");
} catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}

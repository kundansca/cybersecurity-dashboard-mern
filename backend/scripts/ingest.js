/**
 * Import CISA KEV JSON into MongoDB (one document per CVE).
 * Clears the `vulnerabilities` collection, then inserts in batches.
 *
 * Run:
 *   node scripts/ingest.js
 *   node scripts/ingest.js path/to/known_exploited_vulnerabilities.json
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Vulnerability = require("../src/models/Vulnerability");
const { parseCatalogDate } = require("../src/utils/dates");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "kev_catalog";
const DEFAULT_JSON = path.join(__dirname, "..", "data", "known_exploited_vulnerabilities.json");

const BATCH_SIZE = 500;

function safeString(value, fallback = "") {
  if (value == null) {
    return fallback;
  }
  return String(value).trim();
}

function safeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter(Boolean);
}

/** Raw row -> doc; null = skip */
function mapJsonRowToDocument(rawRow, catalogVersionString) {
  const cveID = safeString(rawRow.cveID);
  if (!cveID) {
    return null;
  }

  return {
    cveID,
    vendorProject: safeString(rawRow.vendorProject),
    product: safeString(rawRow.product),
    vulnerabilityName: safeString(rawRow.vulnerabilityName),
    dateAdded: parseCatalogDate(rawRow.dateAdded),
    dueDate: parseCatalogDate(rawRow.dueDate),
    knownRansomwareCampaignUse: safeString(rawRow.knownRansomwareCampaignUse, "Unknown"),
    cwes: safeStringArray(rawRow.cwes),
    shortDescription: safeString(rawRow.shortDescription),
    requiredAction: safeString(rawRow.requiredAction),
    notes: safeString(rawRow.notes),
    catalogVersion: safeString(catalogVersionString),
    ingestedAt: new Date(),
  };
}

/** Duplicate CVE in file -> last wins */
function dedupeDocumentsByCve(documents) {
  const byCve = new Map();
  for (const doc of documents) {
    if (doc && doc.cveID) {
      byCve.set(doc.cveID, doc);
    }
  }
  return Array.from(byCve.values());
}

async function ingest(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error("JSON file not found: " + absolutePath);
  }

  const fileContent = fs.readFileSync(absolutePath, "utf8");
  const jsonRoot = JSON.parse(fileContent);

  if (!jsonRoot || !Array.isArray(jsonRoot.vulnerabilities)) {
    throw new Error("Invalid KEV JSON: root object must contain a `vulnerabilities` array.");
  }

  const catalogVersion = safeString(jsonRoot.catalogVersion);

  const allDocuments = dedupeDocumentsByCve(
    jsonRoot.vulnerabilities.map((row) => mapJsonRowToDocument(row, catalogVersion)).filter(Boolean)
  );

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });

  const deleteResult = await Vulnerability.deleteMany({});
  console.log("Cleared existing rows | deletedCount:", deleteResult.deletedCount);

  for (let startIndex = 0; startIndex < allDocuments.length; startIndex += BATCH_SIZE) {
    const batch = allDocuments.slice(startIndex, startIndex + BATCH_SIZE);
    await Vulnerability.insertMany(batch, { ordered: false });
    const insertedSoFar = Math.min(startIndex + batch.length, allDocuments.length);
    console.log("Step: insert progress", insertedSoFar, "/", allDocuments.length);
  }

  await Vulnerability.syncIndexes();
  console.log(
    "Done | total documents:",
    allDocuments.length,
    "| catalogVersion:",
    catalogVersion || "(empty)"
  );
}

const jsonFilePath = process.argv[2] || process.env.KEV_JSON_PATH || DEFAULT_JSON;

ingest(jsonFilePath)
  .catch((error) => {
    console.error("Ingest failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });

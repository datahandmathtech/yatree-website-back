const { MongoClient } = require("mongodb");
async function copyDB() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const sourceDb = client.db("Yatree");
    const destDb = client.db("GoGetGo");
    const collections = await sourceDb.listCollections().toArray();
    for (let colInfo of collections) {
      const colName = colInfo.name;
      const docs = await sourceDb.collection(colName).find({}).toArray();
      if (docs.length > 0) {
        await destDb.collection(colName).deleteMany({});
        await destDb.collection(colName).insertMany(docs);
        console.log(`Copied ${docs.length} documents for ${colName}`);
      }
    }
    console.log("Database copy complete!");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
copyDB();

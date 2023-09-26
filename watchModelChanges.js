const { OpenAI } = require("openai");
const BluebirdPromise = require("bluebird");
const request = require("request");
const fs = require("fs");
const MongoClient = require('mongodb').MongoClient;
const { Client } = require("@elastic/elasticsearch");

require("dotenv").config();
MongoUri = "mongodb+srv://devadmin:eY20dy7lcdWKBwFN@development-in.qx9yt.mongodb.net/";
const dbName = "Applaud-Naresh";
// const client = new MongoClient(MongoUri, { useUnifiedTopology: true });

MongoClient.connect(MongoUri, (err, client) => {
    if(err) console.log(err);
    const db = client.db(dbName);
    const collectionName = "Task";
    const collection = db.collection(collectionName);

    // const collection = db.collection('inventory');
    const changeStream = collection.watch();

    changeStream.on('onInsert', (change) => {
        console.log('change detectd : ', change);
    });
})


setInterval(() => {
    // console.log('checking...');
}, 1000);
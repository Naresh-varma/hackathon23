const { OpenAI } = require("openai");
const BluebirdPromise = require("bluebird");
const request = require("request");
const fs = require("fs");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
});
require("dotenv").config();

const putIndexMapping = () => new Promise((resolve, reject) => {
    client.indices
      .putMapping({
        index: "test_embeedings",
        properties: {
          "title-vector": {
            type: "dense_vector",
            dims: 1536,
            index: true,
            similarity: "cosine",
          },
          title: {
            type: "text",
          },
          description: {
            type: "text",
          },
        },
      })
      .then(() => {
        console.log("mappings created");
        return resolve();
      })
      .catch((err) => reject(err));
  });

const main = () => new Promise((resolve, reject) => {
    return resolve(putIndexMapping());
});

main();

// console.log(client.bulk);

const { OpenAI } = require("openai");
const BluebirdPromise = require("bluebird");
const request = require("request");
const fs = require("fs");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
});
require("dotenv").config();

const allMappings = [
  {
    index: "knowledgearticle",
    properties: {
      "knowledge-vector": {
        type: "dense_vector",
        dims: 1536,
        index: true,
        similarity: "cosine",
      },
    },
  },
  {
    index: "faqs",
    properties: {
      "faqs-vector": {
        type: "dense_vector",
        dims: 1536,
        index: true,
        similarity: "cosine",
      },
    },
  },
  {
    index: "vacancies",
    properties: {
      "vacancy-vector": {
        type: "dense_vector",
        dims: 1536,
        index: true,
        similarity: "cosine",
      },
    },
  },
];

const hasIndex = (index) => new Promise((resolve, reject) => {
    client.indices.exists({ index })
        .then((res) => {
            console.log(`is ${index} exists :`, res.body);
            if (res.body) return resolve(true);
            else return resolve(false);
        })
        .catch(err => reject(err));
});

const createIndex = (index) => new Promise((resolve, reject) => {
    client.indices.create({ index })
        .then((res) => resolve())
        .catch(err => reject(err));
});

const createMappings = (data) => new Promise((resolve, reject) => {
    client.indices.putMapping({ index: data.index, properties: data.properties })
        .then((res) => resolve())
        .catch(err => reject(err));
});

const checkAndCreateIndexMappings = (data) => new Promise((resolve, reject) => {
    hasIndex(data.index)
        .then((exists) => {
            if (!exists) return createIndex(data.index);
        })
        .then(() => createMappings(data))
        .then(() => resolve())
        .catch(err => reject(err));
})

const putIndexMappings = () => new Promise((resolve, reject) => {
    BluebirdPromise.mapSeries(allMappings, (rec) => new Promise((resolve, reject) => {
        console.log('creating mapping for :', rec.index);
        return resolve(checkAndCreateIndexMappings(rec));
    }))
        .then(() => resolve())
        .catch(err => reject(err));
});

putIndexMappings()
    .then(() => {
        console.log('mappings created....');
    })
    .catch(err => {
        console.error('Something went wrong!!! ', err);
    })

// console.log(client.bulk);

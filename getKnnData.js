const fs = require('fs');
const _ = require('lodash');
const { OpenAI } = require('openai');
const BluebirdPromise = require('bluebird');
const request = require('request');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
})
require("dotenv").config();

const main = (queryVector, fields, vectorField, indexName, isReturnHits) => new Promise((resolve, reject) => {
    if (!queryVector) return reject(new Error('Please provide query vector to search'));
    console.log('index details', indexName, vectorField, fields);
    // querying elastic search to get top matched records
    client.search({
        index: indexName ? indexName : 'test_embeedings',
        knn: {
            "field": vectorField ? vectorField : "title-vector",
            "query_vector": queryVector,
            "k": 5, // how many records you want ?
            "num_candidates": 10000, // how many records we need to search max for proper results ?
        },
        fields: fields ? fields : ["title", "content"]
    }).then((res) => {
        console.log(res.hits.hits[0]);
        console.log(`Found ${_.get(res, 'hits.hits.length')} matched record(s)`);
        let data = '';
        if (isReturnHits && !_.isEmpty(_.get(res, 'hits.hits'))) {
            return resolve(_.get(res, 'hits.hits'));
        }
        if (!_.isEmpty(_.get(res, 'hits.hits'))) {
           _.each(res.hits.hits, (hit) => {
            console.log('HITS', hit);
            const source = _.get(hit, '_source');
            delete source[vectorField];
            data = JSON.stringify(source);
           });
        }
        return resolve(data);
    }).catch((err) => {
        console.error('Error while getting vector search results :', err);
        return reject(err);
    })
})

module.exports = {
    main,
}

// console.log(client.bulk);
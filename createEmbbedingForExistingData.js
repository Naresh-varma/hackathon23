const { OpenAI } = require("openai");
const BluebirdPromise = require("bluebird");
const request = require("request");
const fs = require("fs");
const MongoClient = require('mongodb').MongoClient;
const { Client } = require("@elastic/elasticsearch");
const _ = require('lodash');
const getEmbedding = require('./llmMain').getEmbeddings;

const client = new Client({
    node: 'http://localhost:9200',
})

require("dotenv").config();
MongoUri = "mongodb+srv://devadmin:eY20dy7lcdWKBwFN@development-in.qx9yt.mongodb.net/";
const dbName = "ApplaudCloud-Naresh";


const mapper = {
    '642132dd3d73be2200773da5-KnowledgeArticle': {
        index: 'knowledgearticle',
        fields: ['abstract', 'body'],
        vectorField: 'knowledge-vector'
    },
    '642132dd3d73be2200773da5-Faq': {
        index: 'faqs', 
        fields: ['question', 'answer'],
        vectorField: 'faqs-vector'
    },
    '642132dd3d73be2200773da5-Vacancy': {
        index: 'vacancies',
        fields: ['jobtitle', 'years of experience', 'job description', 'skilltxt'],
        vectorField: 'vacancy-vector'
    }

}

const processData = (data, modelName) => new Promise((resolve, reject) => {
    const modelDetails = mapper[modelName];
    const fields = modelDetails.fields;
    BluebirdPromise.mapSeries(data, (rec) => new Promise((resolve, reject) => {
       let text = '';
       rec['id'] = `${rec['_id']}`;
       delete rec._id;
       _.each(fields, (field) => {
            if (rec[field]) text += `${rec[field]} `;
       });
       if (!text) return resolve();
       console.log('text: ', text);
       getEmbedding(text)
        .then((embedRes) => {
            if (embedRes) rec[modelDetails.vectorField] = embedRes
        })
        .then(() => resolve())
        .catch((embedErr) => reject(embedErr));
    }))
        .then(() =>  resolve())
        .catch(err => reject(err));
})

const makeBulkRequestToEls = (data, indexName) => new Promise((resolve, reject) => {
    client.bulk({
        body: data.flatMap(doc => [{ index: { _index: indexName } }, doc])
    }).then((body) => {
        console.log('Response :', body.items[0].index);
        return resolve();
    }).catch((err) => {
        console.error('getting error while posting data to elastic search :', err);
        return reject(err);   
    });
})

const collections = [
    '642132dd3d73be2200773da5-KnowledgeArticle', 
    '642132dd3d73be2200773da5-Faq',
    '642132dd3d73be2200773da5-Vacancy'
];

const seedData = (db) => new Promise((resolve, reject) => {
    BluebirdPromise.mapSeries(collections, (modelName) => new Promise((resolve, reject) => {
        const collection = db.collection(modelName);
        collection.find({}).toArray((err, data) => {
            if (err) {
                console.error('Error while generating data :', err);
                return resolve();
            }
            if (_.isEmpty(data)) {
                console.log('no data found for model :', modelName);
                return resolve();
            }
            processData(data, modelName)
                .then(() => makeBulkRequestToEls(data, mapper[modelName].index) )
                .catch(err => reject(err))
        });
    }))
        .then(() => {
            console.log('data generated');
            return resolve();
        })
        .catch(err => reject(err));
})

MongoClient.connect(MongoUri, (err, client) => {
    if(err) console.log(err);
    const db = client.db("642132dd3d73be2200773da5");
    seedData(db)
        .then(() => {
            console.log('seed completed');
        })
        .catch(console.error);
        
});

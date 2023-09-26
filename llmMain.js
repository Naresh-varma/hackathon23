const { OpenAI } = require('openai');
const _ = require('lodash');
const fs = require('fs');
const getLLmResponse = require('./index').main;
const getMatchedData = require('./getKnnData').main;
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_PAID
});

async function getEmbeddings(text) {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
    });
    return _.get(embedding, 'data[0].embedding');
}

async function processUserQuery(userQuery) {
    /*
        1) get keywords
        2) get embeedings for keywords
        3) perform the query
        4) pick top two responses text
        5) ask openAI for the answer
    */
   try {
       const keywords = await getLLmResponse('keywords', userQuery);
       const embedRes = await getEmbeddings(keywords);
       const feed = await getMatchedData(embedRes);
       console.log(feed);
       const llm_answer = await getLLmResponse('getAnswer', userQuery, feed);
       console.log(llm_answer);
       return llm_answer;
   } catch(err) {
        console.error('Something went wrong!!!', err);
        throw err;
   }
}

async function getRecommendationforPerson(person) {
    if (!person) {
        person = {
            collection: 'person',
            name: 'Nivya',
            email: 'nivya@gmail.com',
            location: 'Bangalore',
            education: 'B-tech',
            workExperience: '4 years',
            skills: ['VueJs', 'meterialUI', 'redux', 'mongo'],
            certifications: ['product engineer']
        };
    }
    const vectorText = person.name + person.certifications.join(', ') + person.location + person.education + person.workExperience + person.skills.join(', ');
    const embeedings = await getEmbeddings(vectorText);
    let recommendations = await getMatchedData(embeedings, [], 'vacancy-vector', 'vacancy', true);
    const vacationFields = ['title', 'requiredSkills', 'jobDescription', 'location', 'employementType'];
    recommendations = recommendations.map(r => _.pick(r._source, vacationFields));
    return recommendations;
}

module.exports = {
    processUserQuery,
    getRecommendationforPerson,
}
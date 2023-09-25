const { OpenAI } = require('openai');
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
    return embedding;
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
       // const feed = step3 & 4 combained response
       const feed = await getMatchedData(queryVector);
       const llm_answer = await getLLmResponse('getAnswer', userQuery, feed);
       return llm_answer;
   } catch(err) {
        console.error('Something went wrong!!!', err);
        throw err;
   }
}

module.exports = {
    processUserQuery,
}
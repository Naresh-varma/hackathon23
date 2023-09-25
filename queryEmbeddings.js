const { OpenAI } = require('openai');
const fs = require('fs');

const open_ai = require('./index');
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

async function main(userQuery) {
    /*
        1) get keywords
        2) get embeedings for keywords
        3) perform the query
        4) pick top two responses text
        5) ask openAI for the answer
    */
    const keywords = await open_ai.main('keywords', userQuery);
    const embedRes = await getEmbeddings(keywords);
    // const feed = step3 & 4 combained response
    const llm_answer = await open_ai.main('getAnswer', userQuery, feed);
    fs.writeFileSync(query.split(' ').join('_'), JSON.stringify(embedRes?.data[0]?.embedding));
    return resolve();
}

main();

// console.log(client.bulk);
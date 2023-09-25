const { OpenAI } = require('openai');
const BluebirdPromise = require('bluebird');
const request = require('request');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
})
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_PAID
});

const arr = [
    {
    "title": "The Basics of Computer Programming",
    "content": "Computer programming involves writing instructions (code) that a computer can interpret and execute. It requires knowledge of programming languages like Python, Java, C++, and more. Programmers use logic, algorithms, and data structures to solve problems and create software applications, games, and websites that power our digital world."
    },
    {
    "title": "The Human Digestive System",
    "content": "The human digestive system is a complex series of organs responsible for breaking down food and absorbing nutrients. It includes the mouth, esophagus, stomach, small intestine, large intestine, and various associated glands. Digestion begins in the mouth with the action of enzymes and continues through a carefully orchestrated process that ensures essential nutrients reach the body's cells."
    },
    {
    "title": "Renewable Energy Sources",
    "content": "Renewable energy sources are natural resources that can be replenished over time. They include solar energy, wind power, hydropower, geothermal energy, and biomass. Unlike fossil fuels, which are finite, renewable energy sources offer sustainable and environmentally friendly alternatives for meeting our energy needs."
    },
    {
    "title": "The Water Cycle",
    "content": "The water cycle, also known as the hydrologic cycle, is the continuous movement of water on, above, and below the surface of the Earth. It involves processes such as evaporation, condensation, precipitation, and runoff. This cycle regulates the distribution of water across the planet, sustaining life and maintaining ecological balance."
    },
    {
    "title": "Photosynthesis in Plants",
    "content": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy in the form of glucose. This vital process occurs in chloroplasts, specialized organelles containing the pigment chlorophyll. Through photosynthesis, plants play a crucial role in the Earth's ecosystem by producing oxygen and providing a source of food for various organisms."
    }
    ]

async function getEmbeddings(text) {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
    });
    return embedding;
}

const makeBulkRequestToEls = (data) => new Promise((resolve, reject) => {
    const indexName = 'test_embeedings';
    client.bulk({
        body: data.flatMap(doc => [{ index: { _index: 'test_embeedings' } }, doc])
    }).then((body) => {
        console.log('Response :', body);
        return resolve();
    }).catch((err) => {
        console.error('getting error while posting data to elastic search :', err);
        return reject(err);   
    });

    // request.post({
    //     url: `http://localhost:9200/${indexName}/_bulk`,
    //     json: true,
    //     body: JSON.stringify().join(),
    // }, (err, res, body) => {
        
    // });
});

const main = () => new Promise((resolve, reject) => {
    BluebirdPromise.mapSeries(arr, (data) => new Promise((resolve, reject) => {
        getEmbeddings(data.content)
            .then((embedRes) => {
                console.log(`Recevied embeedings for ${data.title}`);
                console.log(`embeedings length ${embedRes?.data[0]?.embedding.length}`);
                if (embedRes) {
                    data['title-vector'] = embedRes?.data[0]?.embedding;
                }
                return resolve();
            });
    }))
      .then(() => {
        console.log('completed');
        return resolve(makeBulkRequestToEls(arr));
      })
      .catch(err => console.error(err));
})

main();

// console.log(client.bulk);
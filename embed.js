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

const persons = [
    {
        collection: 'person',
        name: 'Naresh',
        email: 'naresh@gmail.com',
        location: 'Hyderabad',
        education: 'B-tech',
        workExperience: '2 years',
        skillsinternal: ['NodeJs', 'express','elastic', 'mongo'],
        skills: [73,3,3],
        certifications: ['aws certified architect']
    },
    {
        collection: 'person',
        name: 'Nivya',
        email: 'nivya@gmail.com',
        location: 'Bangalore',
        education: 'B-tech',
        workExperience: '4 years',
        skills: ['VueJs', 'meterialUI', 'redux', 'mongo'],
        certifications: ['product engineer']
    }
]

const jobVacancies = [
    {   
        collection: 'vacancy',
        title: 'Backend Engineer',
        location: 'Hyderabad',
        employementType: 'full-time',
        jobDescription: 'We are looking for a talented and experienced Backend Engineer to join our team and help us build and maintain our scalable and reliable backend systems. You will be using ExpressJS and Elasticsearch to develop and maintain RESTful APIs that power our web and mobile applications. Experience with Node.js, RESTful APIs, and cloud computing is a plus. [Hyderabad, Full-time]',
        requiredSkills: ['expressJs', 'elastic'],
    },
    {
        collection: 'vacancy',
        title: 'Frontend Engineer',
        location: 'Hyderabad',
        employementType: 'full-time',
        jobDescription: 'We are looking for a talented and experienced Front-End Engineer to join our team and help us build and maintain our user-facing web and mobile applications. You will be responsible for developing and maintaining the user interface (UI) and user experience (UX) of our applications using HTML, CSS, and JavaScript. You will also work closely with our back-end engineers to integrate the UI and UX with the back-end systems.',
        requiredSkills: ['VueJs', 'meterialUI'],
    }
];

const arr = [
    {
        "title": "The Basics of Computer Programming",
        "content": "We are having an opening to fill for a Senoir designer with proficient knowledge in user research and user experience designing. Should be comfortable to use tools like Figma, Adobe and Balsamiq to prototype and design wireframes. should be comfortable to work anywhere in UK."
    },
]
const arr1 = [
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
    const indexName = data[0].collection ? data[0].collection : 'test_embeedings';
    client.bulk({
        body: data.flatMap(doc => [{ index: { _index: indexName } }, doc])
    }).then((body) => {
        console.log('Response :', body.items[0].index);
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
    BluebirdPromise.mapSeries(jobVacancies, (data) => new Promise((resolve, reject) => {
        let vectorText = data.content;
        if (data.collection === 'vacancy') {
            vectorText = data.title + data.location + data.requiredSkills;
        }
        if (data.collection === 'person') {
            vectorText = data.name + data.certifications.join(', ') + data.location + data.education + data.workExperience + data.skills.join(', ');
        }
        getEmbeddings(vectorText)
            .then((embedRes) => {
                console.log(`Recevied embeedings for ${data.title}`);
                console.log(`embeedings length ${embedRes?.data[0]?.embedding.length}`);
                if (embedRes) {
                    if (data.collection) {
                        data[`${data.collection}-vector`] = embedRes?.data[0]?.embedding;
                    } else data['title-vector'] = embedRes?.data[0]?.embedding;
                }
                return resolve();
            });
    }))
      .then(() => {
        console.log('completed');
          return resolve(makeBulkRequestToEls(jobVacancies));
      })
      .catch(err => console.error(err));
})

main();

// console.log(client.bulk);
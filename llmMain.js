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

function getVecterText(vacancies) {
    if (!_.isArray(vacancies)) vacancies = [vacancies];
    let text = '';
    _.forEach(vacancies, (vacancy) => {
        text += vacancy.title + vacancy.location + vacancy.requiredSkills.join(', ')
    });
    console.log(text);
    return text;
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
            "collection": "person",
            "name": "Michael Clark",
            "email": "michael.clark@example.com",
            "location": "London",
            "education": "MBA",
            "workExperience": "6 years",
            "skills": ["Financial Analysis", "Budgeting", "Leadership"],
            "certifications": ["CFA"]
        };
    }
    const vectorText = person.name + person.certifications.join(', ') + person.location + person.education + person.workExperience + person.skills.join(', ');
    const embeedings = await getEmbeddings(vectorText);
    const recommendations = await getMatchedData(embeedings, ['title', 'requiredSkills', 'jobDescription'], 'vacancy-vector', 'vacancy', true);
    console.log(recommendations);
}

async function getApplicantRecommendationsForGivenVacancy(vacancy) {
    if (!vacancy) {
        vacancy = {
            "collection": "vacancy",
            "title": "Content Writer",
            "location": "San Francisco",
            "employmentType": "full-time",
            "jobDescription": "We're seeking a talented Content Writer to join our team. You'll be responsible for creating engaging and relevant content across various platforms. Strong writing and editing skills, creativity, and ability to adapt to different tones and styles are essential. [San Francisco, Full-time]",
            "requiredSkills": ["Content Writing", "Editing", "Creativity"]
        };
    }
    const vectorText = getVecterText(vacancy);
    const keywords = await getLLmResponse('keywords', vectorText);
    const embeedings = await getEmbeddings(keywords);
    const recommendations = await getMatchedData(embeedings, ['name', 'email', 'skillsinternal'], 'person-vector', 'person', true);
    console.log(recommendations);
}

module.exports = {
    processUserQuery,
}

// processUserQuery('what is energy');

getApplicantRecommendationsForGivenVacancy();
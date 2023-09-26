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
        text += vacancy.jobTitle + vacancy.location + vacancy.skilltext
    });
    return text;
}

const indexMapper = (index) => {
    const typeMapper = {
        'knowledgearticle': {
            fields: ['title', 'abstract', 'body'],
            vectorField: 'knowledge-vector'
        },
        'vacancy': {
            fields: ['jobtitle', 'location', 'yearsOfExpirence', 'jobDescription', 'skilltext'],
            vectorField: 'vacancy-vector'
        },
        'faqs': {
            fields: ['question', 'answer'],
            vectorField: 'faqs-vector'
        }
    }
    return typeMapper[index];
}

async function processUserQuery(userQuery, index) {
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
        let fields = [];
        let vectorField;
        console.log('Index', index);
       const indexDetails = indexMapper(index);
       const feed = await getMatchedData(embedRes, indexDetails.fields, indexDetails.vectorField, index, false);
       console.log('Feed', feed);
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
    // const vectorText = person.name + person.certifications.join(', ') + person.location + person.education + person.workExperience + person.skills.join(', ');
    const vectorText = person.skills.join(', ');
    const embeedings = await getEmbeddings(vectorText);
    let recommendations = await getMatchedData(embeedings, [], 'vacancy-vector', 'vacancy', true);
    const vacationFields = ['title', 'requiredSkills', 'jobDescription', 'location', 'employementType'];
    recommendations = recommendations.map(r => _.pick(r._source, vacationFields));
    return recommendations;
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
    const personFields = ['firstName', 'lastName', 'workemail', 'skillText'];
    let recommendations = await getMatchedData(embeedings, personFields, 'personess-vector', 'personess', true, 3);
    if (recommendations && recommendations.length) {
        _.each(recommendations, (item) => {
            delete item._source['personess-vector'];
            if (item._score) item._score = item._score * 100;
        });
    }
    return recommendations;
}

async function composeMailForShortListedPerson(vacancy, userName) {
    const param = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": "You are a helpful AI assistant, I want to draft a mail for a job applicant, conveying hey user we have found this opening to you a best match, here I am giving you the vacancy that he is shortlisted for, use this info for drafting the mail don't include this object directly"
            },
            {
                "role": "user",
                "content": "draft the mail for ANil"
            }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    };
    if (vacancy) param.messages[0].content = param.messages[0].content + JSON.stringify(vacancy);
    if (userName) param.messages[1].content = `Draft the mail for ${userName}`;
    const response = await openai.chat.completions.create(param);
    console.log(response.choices[0].message);
    return response.choices[0].message;
}

module.exports = {
    processUserQuery,
    getRecommendationforPerson,
    getApplicantRecommendationsForGivenVacancy,
    getEmbeddings,
}

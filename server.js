const express = require('express')
const bodyParser = require('body-parser');
const _ = require('lodash');
const llm = require('./llmMain');
const app = express()
const port = 3111;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/process-search', async (req, res) => {
    console.log('Query', req.query);
    const query = req.query.searchText;
    const index = req.query.index;
    const answer = await llm.processUserQuery(query, index);
    // res.setHeader('Content-Type', 'application/json');
    console.log('ANS', answer);
    return res.json({ query, answer });
})

app.post('/get-vacancy-recommendations', async (req, res) => {
    const person = req.body;
    const recomendations = await llm.getRecommendationforPerson(person);
    return res.json(recomendations);
});

app.post('/get-person-recommendations', async (req, res) => {
    const vacancies = req.body;
    // call to getRecommendationforVacancies;
});
app.post('/vacancy-recommendations', async (req, res) => {
    const vacancy = req.body;
    console.log('vacancy :', vacancy);
    const data = await llm.getApplicantRecommendationsForGivenVacancy(vacancy);
    return res.json(data);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
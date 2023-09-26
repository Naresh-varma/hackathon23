const express = require('express')
const _ = require('lodash');
const llm = require('./llmMain').processUserQuery;
const app = express()
const port = 3111

app.get('/process-search', async (req, res) => {
    console.log('Query', req.query);
    const query = req.query.searchText;
    const index = req.query.index;
    const answer = await llm(query, index);
    // res.setHeader('Content-Type', 'application/json');
    console.log('ANS', answer);
    return res.json({ query, answer });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
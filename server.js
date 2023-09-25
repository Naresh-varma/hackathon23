const express = require('express')
const _ = require('lodash');
const llm = require('./llmMain').processUserQuery;
const app = express()
const port = 3111

app.get('/process-search', async (req, res) => {
    console.log(req.query);
    const query = req.query.searchText;
    const answer = await llm(query);
    // res.setHeader('Content-Type', 'application/json');
    return res.json({ query, answer });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
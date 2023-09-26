const OpenAI = require('openai').OpenAI;
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_PAID
});

const getKeywords = [
  {
    role: "system",
    content: "You will be provided with a block of text, and your task is to extract a list of keywords from it."
  },
  {
    role: "user",
    content: ''
}];

const getAnswer = [{
  role: "system",
  content: "You are my helpful agent, I will give you the content and you have to understand the content and answer my question from the content, Keep the response very short and strightforward\n\ncontent: \" ${} "
},
{
  role: "user",
  content: ''
}];

const getFaqs = [{
  question: 'programming',
  answer: "answer"
}];

async function main(queryType, query, feed) {
  const message = queryType === 'keywords' ? getKeywords : getAnswer;
  if (queryType === 'getAnswer' && feed) message[0].content = message[0].content + feed + '\"\n\n';
  message[1].content = query;
  const completion = await openai.chat.completions.create({
    messages: message,
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    max_tokens: 256,
    top_p: 1,
  });
  console.log('Test', completion.choices[0].message);
  return completion.choices[0].message.content;
}

module.exports = {
  main,
}

// main('khed', 'what is photosythasis');
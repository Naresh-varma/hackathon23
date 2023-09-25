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
  content: "You are my helpful agent, I will give you the content and you have to understand the content and answer my question from the content, Keep the response very short and strightforward\n\ncontent: \"Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy in the form of glucose. This vital process occurs in chloroplasts, specialized organelles containing the pigment chlorophyll. Through photosynthesis, plants play a crucial role in the Earth's ecosystem by producing oxygen and providing a source of food for various organisms. \"\n\n"
},
{
  role: "user",
  content: ''
}];

export async function main(queryType, query) {
  const message = queryType === 'keywords' ? getKeywords : getAnswer;
  message[1].content = query;
  const completion = await openai.chat.completions.create({
    messages: message,
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    max_tokens: 256,
    top_p: 1,
  });
  console.log(completion.choices[0].message);
  return completion.choices[0].message.content;
}

// main('khed', 'what is photosythasis');
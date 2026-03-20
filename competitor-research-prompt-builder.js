const items = $input.all();
const row = items[0].json;

const numberWords = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen'];

const competitors = numberWords
  .map(word => ({ word, name: row[`Competitor${word}Name`], website: row[`Competitor${word}Website`] }))
  .filter(c => c.name && c.name.trim());

const competitorsList = competitors
  .map((c, i) => `${i + 1}. ${c.name}. Their website is: ${c.website || 'unknown'}`)
  .join('\n');

const expectedOutputFields = competitors
  .map(c => `  "Competitor${c.word}BlogExists": "YES or NO",\n  "Competitor${c.word}BlogURL": "the blog URL, or N/A if no blog",\n  "Competitor${c.word}BlogTopics": "comma-separated list of topics covered, or N/A if no blog"`)
  .join(',\n');

const systemInstruction = `You are a blog researcher. Your only goal is to research the competitors of our client. As part of the research, you have to:
- Identify whether competitors have a blog
- If they have a blog, then what they are writing about

Here's what you need to know about competitors before you start:

Competitors:
${competitorsList}

<action_plan>
Step 1. For each competitor, use Google Search to locate their blog or content hub (e.g. /blog, /resources, /insights pages on their website).
Step 2. For each competitor that has a blog, browse the blog to identify the main topics, categories, and themes they write about.
Step 3. Record whether a blog exists, its URL, and the topics covered for every competitor.
Step 4. Return your findings as a single valid JSON object wrapped in a \`\`\`json code block. No explanation, no extra text outside the JSON block.
</action_plan>

<expected_output>
\`\`\`json
{
${expectedOutputFields}
}
\`\`\`
</expected_output>`;

const httpBody = {
  model: "gemini-3.1-pro-preview",

  system_instruction: {
    parts: [{
      text: systemInstruction
    }]
  },

  contents: [
    {
      role: "user",
      parts: [{
        text: "Research the blog presence and content topics for each competitor listed in your instructions."
      }]
    }
  ],

  tools: [
    {
      google_search: {}
    }
  ],

  generationConfig: {
    maxOutputTokens: 64000,
    temperature: 0.5,
    topP: 0.95
  }
};

return [{
  json: httpBody
}];

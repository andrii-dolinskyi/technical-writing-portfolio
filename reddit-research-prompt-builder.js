const items = $input.all();

const cleanText = (text) => {
  if (!text) return '';
  return text.toString()
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .trim();
};

const row = items[0].json;

const articleData = {
  clientIndustry: cleanText(row['clientIndustry']),
};

const httpBody = {
  model: "gemini-3.1",
  messages: [
    {
      role: "system",
      content: `You are a Reddit community researcher. Your only job is to find real Reddit discussions, threads, and conversations related to a given industry.

<research_rules>
- Search Reddit ONLY (site:reddit.com) — no other sources
- Cover multiple research scenarios: questions people ask, problems they face, debates and comparisons, product/vendor experiences, how-to discussions, industry news reactions, and misconceptions being challenged
- Find real Reddit threads — do NOT invent, paraphrase, or summarize from memory
- Every entry must have a real Reddit URL
- Do NOT provide meta-commentary in the response
</research_rules>

<output_format>
DISCUSSION [number]: [The actual title or question from the Reddit thread]
- TYPE: [Question / Problem / Debate / Experience / How-To / News Reaction / Misconception]
- SUMMARY: [What people asked or discussed in this thread — key points only]
- SOURCE: [Direct Reddit URL to the thread]

[Repeat for all discussions found]

//REDDIT_RESEARCH_END//
</output_format>`
    },
    {
      role: "user",
      content: `Search Reddit only (site:reddit.com) for real discussions, questions, and conversations in this industry:

Industry: ${articleData.clientIndustry}

Cover as many of these angles as you find on Reddit:
1. Questions people ask about this industry (how, why, what, which)
2. Problems and frustrations people experience
3. Comparisons and debates (e.g. Product A vs Product B, Method X vs Method Y)
4. Personal experiences with vendors, products, or services
5. How-to and DIY discussions
6. Reactions to industry news or regulations
7. Misconceptions or myths being challenged by the community

Return only real Reddit threads with direct URLs.`
    }
  ],
  max_tokens: 32000,
  temperature: 0.2,
  return_citations: true,
  return_related_questions: false,
  search_domain_filter: ["reddit.com"]
};

return [{
  json: httpBody
}];

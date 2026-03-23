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
  clientName:     cleanText(row['clientName']),
  clientWebsite:  cleanText(row['clientWebsite']),
  clientCountry:  cleanText(row['clientCountry']),
  clientProduct:  cleanText(row['clientProduct']),
  clientIndustry: cleanText(row['clientIndustry']),
};

const httpBody = {
  model: "gemini-3.1-pro-preview",

  system_instruction: {
    parts: [{
      text: `You are an Industry Research Specialist. You are an expert in analyzing industries, identifying blog article types with highest E-E-A-T scores for those industries, and providing specific examples.

<critical_rules>
- Conduct thorough industry research based on the client information in order to identify to which industry/sector they belong
- Research blog article types that convert leads in this specific industry/sector of the client
- Tailor article types to the target audiences and pain points of the client's ICPs
- Provide 5 specific examples per article type
- Do NOT provide your meta-commentary
- Do NOT invent article types
- Do NOT invent examples for article types
- Do NOT ever suggest article types and examples based on your training data because this must always come from research!
</critical_rules>
<output_format>
**Blog article type [Article Type Number]:** [Article Type Name]
- **Purpose:** [write one sentence explaining the purpose of this article type]
- **Example 1:**
  - **Title Example:** [provide a real example of an article title so the user can refer to the real example instead of the made-up one]
  - **Key Points Discussed:** [summarize concisely what specific key points are discussed in this article, whose title you reffered]
  - **URL:** [provide a link to the article example, whose title you reffered]
[Continue with the remaining 4 examples for the same article type]
[Then, continue with other article types and 5 examples for each of them]

//ARTICLE_TYPES_END//
</output_format>`
    }]
  },

  contents: [
    {
      role: "user",
      parts: [{
        text: `Identify the client's industry and what the client does and sells, then research it in order to understand what blog article types are appropriate for this field.

Client Name: ${articleData.clientName}
Client Website: ${articleData.clientWebsite}
Client Country: ${articleData.clientCountry}
Client Industry: ${articleData.clientIndustry}
Client Products/Services: ${articleData.clientProduct}`
      }]
    }
  ],

  tools: [
    {
      google_search: {}
    }
  ],

  generationConfig: {
    maxOutputTokens: 20000,
    temperature: 1.0,
    topP: 0.95
  }
};

return [{
  json: httpBody
}];

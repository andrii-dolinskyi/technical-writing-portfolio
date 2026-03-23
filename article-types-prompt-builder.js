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

  // ICP 1
  ICPOneName:       cleanText(row['ICPOneName']),
  ICPOneIndustry:   cleanText(row['ICPOneIndustry']),
  ICPOneRegion:     cleanText(row['ICPOneRegion']),
  ICPOneAudience:   cleanText(row['ICPOneAudience']),
  ICPOnePainPoints: cleanText(row['ICPOnePainPoints']),

  // ICP 2
  ICPTwoName:       cleanText(row['ICPTwoName']),
  ICPTwoIndustry:   cleanText(row['ICPTwoIndustry']),
  ICPTwoRegion:     cleanText(row['ICPTwoRegion']),
  ICPTwoAudience:   cleanText(row['ICPTwoAudience']),
  ICPTwoPainPoints: cleanText(row['ICPTwoPainPoints']),

  // ICP 3
  ICPThreeName:       cleanText(row['ICPThreeName']),
  ICPThreeIndustry:   cleanText(row['ICPThreeIndustry']),
  ICPThreeRegion:     cleanText(row['ICPThreeRegion']),
  ICPThreeAudience:   cleanText(row['ICPThreeAudience']),
  ICPThreePainPoints: cleanText(row['ICPThreePainPoints']),

  // Content guidelines
  claimsAvoid:   cleanText(row['claimsAvoid']),
  topicsAvoid:   cleanText(row['topicsAvoid']),
  contentTone:   cleanText(row['contentTone']),
  clientKeywords: cleanText(row['clientKeywords']),
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
        text: `Research the client's industry and identify what blog article types are most appropriate and effective for generating B2B leads in this field.

---
**CLIENT OVERVIEW**
- Name: ${articleData.clientName}
- Website: ${articleData.clientWebsite}
- Country: ${articleData.clientCountry}
- Industry: ${articleData.clientIndustry}
- Products/Services: ${articleData.clientProduct}

---
**TARGET AUDIENCES (ICPs)**

${articleData.ICPOneName ? `**${articleData.ICPOneName}**
- Industries: ${articleData.ICPOneIndustry}
- Regions: ${articleData.ICPOneRegion}
- Decision-makers: ${articleData.ICPOneAudience}
- Pain points: ${articleData.ICPOnePainPoints}` : ''}

${articleData.ICPTwoName ? `**${articleData.ICPTwoName}**
- Industries: ${articleData.ICPTwoIndustry}
- Regions: ${articleData.ICPTwoRegion}
- Decision-makers: ${articleData.ICPTwoAudience}
- Pain points: ${articleData.ICPTwoPainPoints}` : ''}

${articleData.ICPThreeName ? `**${articleData.ICPThreeName}**
- Industries: ${articleData.ICPThreeIndustry}
- Regions: ${articleData.ICPThreeRegion}
- Decision-makers: ${articleData.ICPThreeAudience}
- Pain points: ${articleData.ICPThreePainPoints}` : ''}

---
**CONTENT GUIDELINES**
- Tone: ${articleData.contentTone}
- Topics to avoid: ${articleData.topicsAvoid}
- Claims to avoid: ${articleData.claimsAvoid}
- Target keywords: ${articleData.clientKeywords}

---
Based on all of the above, research and identify the most effective blog article types for this client's industry and ICPs.`
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

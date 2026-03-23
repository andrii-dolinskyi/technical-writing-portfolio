const items = $input.all();
const row = items[0].json;

// ICP fields (normalized by icp-splitter upstream)
const icpName       = (row['ICPName']       || '').trim();
const icpIndustry   = (row['ICPIndustry']   || '').trim();
const icpRegion     = (row['ICPRegion']      || '').trim();
const icpAudience   = (row['ICPAudience']    || '').trim();
const icpPainPoints = (row['ICPPainPoints']  || '').trim();

// Client context
const clientName    = (row['clientName']    || '').trim();
const clientProduct = (row['clientProduct'] || '').trim();

// Build context block — only include fields that exist
const contextLines = [];
if (icpIndustry)   contextLines.push(`Industry: ${icpIndustry}`);
if (icpAudience)   contextLines.push(`Job titles / roles: ${icpAudience}`);
if (icpRegion)     contextLines.push(`Region: ${icpRegion}`);
if (icpPainPoints) contextLines.push(`Reported pain points: ${icpPainPoints}`);
if (clientName)    contextLines.push(`Client selling to them: ${clientName}`);
if (clientProduct) contextLines.push(`Client product: ${clientProduct}`);

const buyerContext = contextLines.join('\n');

const systemPrompt = `You are a B2B market researcher specializing in industrial buyer behavior. Your job is to find real, documented evidence of how a specific type of buyer thinks, talks, and behaves online.

<research_rules>
- ONLY report what you find through live web search — real threads, posts, documents, publications
- Do NOT invent discussions, paraphrase from memory, or fabricate URLs
- Do NOT generalize from training knowledge — search and verify each data point
- If you cannot find a real source for a data point, omit it entirely
- Every discussion entry must reference a real platform and include a real URL
- Every terminology entry must be traceable to a real source (job posting, RFP, trade publication, LinkedIn, industry standard)
- Every vendor expectation entry must come from a real RFP, buyer report, survey, or documented source
</research_rules>

<output_format>
Produce exactly three sections in this order. Use the exact section headers and end markers shown below.

---
SECTION 1: FORUM & COMMUNITY DISCUSSIONS

DISCUSSION [number]: [Exact thread title, post title, or question as it appears on the source platform]
- PLATFORM: [Reddit / LinkedIn / Stack Exchange / industry forum / trade publication / other]
- URL: [Direct URL to the thread or post]
- WHO IS DISCUSSING: [Describe who posted or replied — role, industry context if visible]
- KEY CONCERNS OR PHRASES: [Quote or closely paraphrase the specific concerns, language, or questions raised]

[Repeat for each discussion found. Aim for at least 6–10 entries if real sources exist.]

//DISCUSSIONS_END//

---
SECTION 2: TERMINOLOGY

For each entry, note the source type where you found it (job posting / RFP / trade publication / LinkedIn profile / industry standard / forum).

TECHNICAL TERMS: [Exact technical terms this buyer uses — one per line, with source type]
ACRONYMS: [Acronym: full meaning — one per line]
PAIN POINT PHRASES: [Exact phrases this buyer uses when describing their problems — one per line, with source type]
PROCUREMENT LANGUAGE: [Phrases found in RFPs, tenders, or procurement documents — one per line]

//TERMINOLOGY_END//

---
SECTION 3: WHAT THEY WANT FROM A VENDOR

Based only on real RFPs, procurement specs, buyer reviews, industry surveys, or documented evaluations:

MUST-HAVES: [Non-negotiable requirements — one per line]
COMMON OBJECTIONS OR HESITATIONS: [What slows or blocks their buying decision — one per line]
EVALUATION CRITERIA: [How they compare vendors or solutions — one per line]
QUESTIONS THEY ASK VENDORS: [Real questions from forums, RFPs, or documented buyer interactions — one per line]

//EXPECTATIONS_END//
</output_format>`;

const userPrompt = `Research this B2B buyer profile and find real documented evidence of how they talk, what they discuss, and what they expect from a vendor.

${buyerContext}

Search the following sources:

For Section 1 (Forum discussions):
- Reddit: r/foodscience, r/foodsafety, r/waterpurification, r/manufacturing, r/facilities — search for "${icpIndustry} water treatment", "${icpIndustry} disinfection", "${icpAudience} ozone"
- LinkedIn posts and articles from people with job titles: ${icpAudience || 'relevant roles'} in ${icpIndustry}
- Stack Exchange (Engineering, Chemistry, Sustainability) for technical questions from this buyer type
- Industry forums and trade publication comment sections: WaterWorld, Food Safety Magazine, FoodNavigator, Process Industry Forum

For Section 2 (Terminology):
- LinkedIn job postings for titles like ${icpAudience || 'plant manager, QA manager, facility director'} to extract technical vocabulary
- RFP and tender documents for "${icpIndustry} water treatment" or "${icpIndustry} disinfection system"
- Trade publication articles written for this audience

For Section 3 (Vendor expectations):
- RFP and tender specifications for water treatment or disinfection systems in ${icpIndustry}
- Buyer guides or technology comparison reports in trade publications for this industry
- Industry association white papers or conference proceedings

Only return what you find through search. Omit anything you cannot source.`;

const httpBody = {
  model: "sonar-pro",
  messages: [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: userPrompt
    }
  ],
  temperature: 0.1,
  return_citations: true,
  return_related_questions: false
};

return [{
  json: {
    ...httpBody,
    _meta: {
      icpName,
      icpIndustry,
      icpRegion
    }
  }
}];

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

// Build context lines only for fields that exist
const contextLines = [];
if (icpIndustry)   contextLines.push(`Industry: ${icpIndustry}`);
if (icpAudience)   contextLines.push(`Job titles / roles: ${icpAudience}`);
if (icpRegion)     contextLines.push(`Region: ${icpRegion}`);
if (icpPainPoints) contextLines.push(`Reported pain points: ${icpPainPoints}`);
if (clientName)    contextLines.push(`Client selling to them: ${clientName}`);
if (clientProduct) contextLines.push(`Client product: ${clientProduct}`);

const buyerContext = contextLines.join('\n');

const systemInstruction = `You are a B2B market researcher specializing in industrial buyer behavior. Your job is to find real, documented evidence of how a specific type of buyer thinks, talks, and behaves online.

<research_rules>
- ONLY report what you find through live research — real threads, posts, documents, publications
- Do NOT invent discussions, paraphrase from memory, or fabricate URLs
- Do NOT generalize from what you know — search and verify
- If you cannot find a real source for a data point, omit it entirely
- Every discussion entry must reference a real platform and a real URL
- Every terminology entry must be traceable to a real source (job posting, RFP, trade publication, LinkedIn, standard)
- Every vendor expectation entry must come from a real RFP, buyer report, review, or documented source
</research_rules>

<output_format>
Produce exactly three sections in this order. Use the exact section headers and end markers shown below.

---
SECTION 1: FORUM & COMMUNITY DISCUSSIONS

DISCUSSION [number]: [Exact thread title, post title, or question as it appears on the source platform]
- PLATFORM: [Reddit / LinkedIn / Stack Exchange / industry forum / trade publication comments / other]
- URL: [Direct URL to the thread or post]
- WHO IS DISCUSSING: [Describe who posted or replied — role, industry context if visible]
- KEY CONCERNS OR PHRASES: [Quote or closely paraphrase the specific concerns, language, or questions raised]

[Repeat for each discussion found. Aim for at least 6–10 entries if real sources exist.]

//DISCUSSIONS_END//

---
SECTION 2: TERMINOLOGY

For each term, note the source type where you found it (job posting / RFP / trade publication / LinkedIn profile / industry standard / forum).

TECHNICAL TERMS: [List of exact technical terms this buyer uses — one per line, with source type]
ACRONYMS: [List of acronyms with their full meaning — one per line]
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

const userPrompt = `Research this B2B buyer profile and find real documented evidence of how they talk, what they discuss, and what they look for in a vendor.

${buyerContext}

Search the following sources to find real data:

For Section 1 (Forum discussions):
- Reddit: search r/foodscience, r/foodsafety, r/waterpurification, r/manufacturing, r/HVAC, r/facilities, r/labrats, and general Reddit search for terms like "${icpIndustry} water treatment", "${icpIndustry} disinfection", "${icpAudience} water quality"
- LinkedIn: search for posts and discussions by people with job titles: ${icpAudience || 'relevant roles'} in ${icpIndustry}
- Stack Exchange (Engineering, Chemistry, Sustainability) for technical questions from this type of buyer
- Trade publication comment sections and industry forum sites (WaterWorld, Food Safety Magazine, FoodNavigator, Process Industry Forum, Aqua Magazine)

For Section 2 (Terminology):
- Search LinkedIn for job postings with titles like ${icpAudience || 'plant manager, QA manager'} to see what technical language they use
- Search for RFPs and tender documents related to "${icpIndustry} water treatment" or "${icpIndustry} disinfection system"
- Look at trade publication articles written for this audience — note the vocabulary used

For Section 3 (Vendor expectations):
- Search for RFP documents or tender specifications for water treatment or disinfection systems in ${icpIndustry}
- Search for buyer guides or technology comparison articles in trade publications for this industry
- Search for conference proceedings or white papers from industry associations related to ${icpIndustry}

Only return what you actually find through this research.`;

const httpBody = {
  model: "gemini-2.5-pro-preview-03-25",

  system_instruction: {
    parts: [{
      text: systemInstruction
    }]
  },

  contents: [
    {
      role: "user",
      parts: [{
        text: userPrompt
      }]
    }
  ],

  tools: [
    {
      google_search: {}
    },
    {
      urlContext: {}
    }
  ],

  generationConfig: {
    maxOutputTokens: 32000,
    temperature: 1.0,
    topP: 0.95
  }
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

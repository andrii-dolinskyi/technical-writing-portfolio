const items = $input.all();
const row = items[0].json;

const numberWords = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
                     'Eleven','Twelve','Thirteen','Fourteen','Fifteen'];

// Collect all non-ICP fields as shared client context
const clientFields = {};
for (const key of Object.keys(row)) {
  if (!key.startsWith('ICP')) {
    clientFields[key] = row[key];
  }
}

// Extract each ICP group into a separate output item
const icpItems = [];
for (const word of numberWords) {
  const name = row[`ICP${word}Name`];
  if (!name || !name.trim()) continue;

  icpItems.push({
    json: {
      ...clientFields,
      ICPName:       row[`ICP${word}Name`]        || '',
      ICPIndustry:   row[`ICP${word}Industry`]    || '',
      ICPRegion:     row[`ICP${word}Region`]       || '',
      ICPAudience:   row[`ICP${word}Audience`]     || '',
      ICPPainPoints: row[`ICP${word}PainPoints`]   || '',
    }
  });
}

return icpItems.length > 0 ? icpItems : [{ json: row }];

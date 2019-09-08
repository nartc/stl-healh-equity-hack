const fuzz = require('fuzzball');
const mongo = require('mongodb');

/**
 * First set of threshold: 55 - 70
 * Second set of threshold: 30 - 40
 * Third set of threshold: 40 - 55
 * Fourth set of threshold: 35 - 50
 * Fifth set of threshold: 37.5 - 52.5
 */
const fuzzRatio = 37.5;
const fuzzPartialRatio = 52.5;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const colName = 'eindescs_with_key_phrases';

client.connect(async err => {
  if (err) {
    console.log('error connecting to db', err);
    return;
  }

  const db = client.db('stl-health-hack');
  const keyPhrasesCol = db.collection(colName);
  const keyPhrases = await keyPhrasesCol.find({}).toArray();
  const categories = await db
    .collection('categories')
    .find({})
    .toArray();

  for (let i = 0; i < keyPhrases.length; i++) {
    const keyPhrase = keyPhrases[i];

    const codes = categories
      .map(cat => {
        const originalString = keyPhrase.phrase_keys
          ? keyPhrase.phrase_keys.split(',').join(' ')
          : '';
        const comparedString = cat.keywords.length
          ? cat.keywords.join(' ')
          : cat.description;

        const ratio = fuzz.ratio(
          originalString.toLowerCase(),
          comparedString.toLowerCase()
        );
        const partialRatio = fuzz.token_set_ratio(
          originalString.toLowerCase(),
          comparedString.toLowerCase(),
          { trySimple: true }
        );

        console.log(`${keyPhrase.EIN}`, ratio, partialRatio);

        if (ratio >= fuzzRatio && partialRatio >= fuzzPartialRatio) {
          return cat.code;
        }

        return '';
      })
      .filter(c => !!c);

    await keyPhrasesCol.updateOne(
      { _id: keyPhrase._id },
      { $set: { SERVICES: codes } }
    );
    console.log(`Updated: ${keyPhrase._id}`);
  }

  console.log('finished');
});

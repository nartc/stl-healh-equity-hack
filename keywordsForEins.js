const mongo = require('mongodb');

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const results = {};

client.connect(async err => {
  if (err) return;
  console.log('connected');

  const db = client.db('stl-health-hack');
  const col = db.collection('queriedbmfs');
  const keywordsAndEins = db.collection('keywordsAndEins');

  const bmfs = await col.find({}).toArray();

  for (let i = 0; i < bmfs.length; i++) {
    const bmf = bmfs[i];

    bmf.KEYWORDS && bmf.KEYWORDS.length &&
      bmf.KEYWORDS.forEach(key => {
        if (results[key]) {
          results[key].push(bmf.EIN);
        } else {
          results[key] = [bmf.EIN];
        }
      });
  }
  console.log('Constructed results object');

  const keywordsForEin = Object.keys(results).reduce((acc, cur) => {
    results[cur].forEach(ein => {
      acc.push({
        keyword: cur,
        ein
      });
    });

    return acc;
  }, []);

  await keywordsAndEins.insertMany(keywordsForEin);
  console.log('Finished');
});

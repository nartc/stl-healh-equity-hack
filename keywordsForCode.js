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
  const col = db.collection('categories');
  const keywordsAndCode = db.collection('keywordsAndCodes');

  const categories = await col.find({}).toArray();

  for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];

        cat.keywords.length && cat.keywords.forEach(key => {
            if (results[key]) {
                results[key].push(cat.code);
            } else {
                results[key] = [cat.code];
            }
        })
  }
  console.log('Constructed results object');

  const keywordsForCode = Object.keys(results).reduce((acc, cur) => {
      results[cur].forEach(code => {
          acc.push({
              keyword: cur,
              code
          });
      });

      return acc;
  }, []);

  await keywordsAndCode.insertMany(keywordsForCode);
  console.log('Finished');
});

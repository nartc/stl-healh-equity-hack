const mongo = require('mongodb');
const { getHour } = require('./utils');

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect(async err => {
  if (err) {
    console.log(err);
    return;
  }

  const db = client.db('stl-health-hack');
  const col = db.collection('queriedbmfs');
  const needToFix = await col.findOne({
    NAME: 'LEBANON HUMANE SOCIETY'
  });

  await col.updateOne(
    { NAME: 'LEBANON HUMANE SOCIETY' },
    {
      $set: {
        HOURS: needToFix.HOURS.map(h => ({
          day: h.day.toLowerCase(),
          hour: getHour(h.hour)
        }))
      }
    }
  );

  console.log('Finished');
});

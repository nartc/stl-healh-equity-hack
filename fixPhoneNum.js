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
  const needToFix = await col.find({
    PHONE_NUM: { $exists: true },
    $expr: { $gt: [{ $strLenCP: '$PHONE_NUM' }, 10] }
  }).toArray();

  for (let i = 0; i < needToFix.length; i++) {
    const fix = needToFix[i];
    console.log(`Updating ${fix.NAME}`);
    await col.updateOne(
      { _id: fix._id },
      {
        $set: {
          PHONE_NUM: fix.PHONE_NUM.substr(1, fix.PHONE_NUM.length).replace(
            /\s/,
            ''
          ).replace('-', '')
        }
      }
    );
  }

  console.log('Finished');
});

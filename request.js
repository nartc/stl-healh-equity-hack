const fs = require('fs');
const mongo = require('mongodb');

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const reqJson = { team_id: 'zlHlK3', data: {} };
const eins = [];

const getHours = (day, hours) => {
  const [opens_at, closes_at] = hours.find(h => h.day === day).hour.split('-');
  return {
    opens_at: opens_at.length < 5 ? `0${opens_at}` : opens_at,
    closes_at
  };
};

client.connect(err => {
  if (err) return;
  console.log('connected');

  const db = client.db('stl-health-hack');
  const col = db.collection('queriedbmfs');
  const codes = db.collection('activitycodes');
  const einsWithCodes = db.collection('eindescs_with_key_phrases');

  einsWithCodes.find({}).toArray((err, einsWithCodes) => {
    col.find({}).toArray((err, docs) => {
      if (err) {
        console.log(err);
        return;
      }

      docs.forEach(doc => {
        reqJson.data[doc.EIN] = {
          name: doc.NAME
        };

        if (doc.HOURS && doc.HOURS.length) {
          console.log(doc.NAME, doc.HOURS);
          reqJson.data[doc.EIN]['hours'] = {
            sunday: getHours('sunday', doc.HOURS),
            monday: getHours('monday', doc.HOURS),
            tuesday: getHours('tuesday', doc.HOURS),
            wednesday: getHours('wednesday', doc.HOURS),
            thursday: getHours('thursday', doc.HOURS),
            friday: getHours('friday', doc.HOURS),
            saturday: getHours('saturday', doc.HOURS)
          };
        }

        if (
          doc.WEBSITE &&
          doc.WEBSITE !== 'N/A' &&
          doc.WEBSITE !== 'NONE' &&
          doc.WEBSITE !== 'None'
        ) {
          reqJson.data[doc.EIN]['url'] = doc.WEBSITE;
        }

        if (
          !!doc.PHONE_NUM &&
          doc.PHONE_NUM !== 'undefined' &&
          doc.PHONE_NUM !== '0'
        ) {
          reqJson.data[doc.EIN]['phone'] = doc.PHONE_NUM;
        }

        const foundCodes = einsWithCodes.find(ewc => ewc.EIN === doc.EIN)
          .SERVICES;
        if (foundCodes.length && foundCodes.some(fc => fc.length >= 3)) {
          reqJson.data[doc.EIN]['services'] = foundCodes.filter(
            fc => fc.length >= 3
          );
        } else if (!!doc.NTEE_CD) {
          reqJson.data[doc.EIN]['services'] = [doc.NTEE_CD.substr(0, 3)];
        }

        eins.push(doc.EIN);
      });

      fs.writeFileSync('request.json', JSON.stringify(reqJson), {
        encoding: 'utf8'
      });
      console.log('Finished');
    });
  });
});

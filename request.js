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
  return { opens_at, closes_at };
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

        if (doc.hours && doc.hours.length) {
          reqJson.data[doc.EIN] = {
            hours: {
              sunday: getHours('sunday', doc.hours),
              monday: getHours('monday', doc.hours),
              tuesday: getHours('tuesday', doc.hours),
              wednesday: getHours('wednesday', doc.hours),
              thursday: getHours('thursday', doc.hours),
              friday: getHours('friday', doc.hours),
              saturday: getHours('saturday', doc.hours)
            }
          };
        }

        // reqJson.data[doc.EIN] = {
        //   hours: {
        //     sunday: {
        //       opens_at: '00:00',
        //       closes_at: '00:00'
        //     },
        //     monday: {
        //       opens_at: '09:00',
        //       closes_at: '17:00'
        //     },
        //     tuesday: {
        //       opens_at: '09:00',
        //       closes_at: '17:00'
        //     },
        //     wednesday: {
        //       opens_at: '09:00',
        //       closes_at: '17:00'
        //     },
        //     thursday: {
        //       opens_at: '09:00',
        //       closes_at: '17:00'
        //     },
        //     friday: {
        //       opens_at: '09:00',
        //       closes_at: '17:00'
        //     },
        //     saturday: {
        //       opens_at: '00:00',
        //       closes_at: '00:00'
        //     }
        //   }
        // };

        if (doc.WEBSITE && doc.WEBSITE !== 'N/A') {
          reqJson.data[doc.EIN]['url'] = doc.WEBSITE;
        }

        if (!!doc.PHONE_NUM && doc.PHONE_NUM !== 'undefined') {
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

        // if (!!doc.ACTIVITY_CODES && doc.ACTIVITY_CODES.length) {
        //   const validCodes = _codes.map(c => c.code).filter(code => doc.ACTIVITY_CODES.includes(code));
        //   if (validCodes.length) {
        //     reqJson.data[doc.EIN]['services'] = reqJson.data[doc.EIN]['services'] ? [...reqJson.data[doc.EIN]['services'], ...validCodes] : [...validCodes];
        //   }

        // }

        eins.push(doc.EIN);
      });

      fs.writeFileSync('request.json', JSON.stringify(reqJson), {
        encoding: 'utf8'
      });
      console.log('Finished');
    });
  });
});

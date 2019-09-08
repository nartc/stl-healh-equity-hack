const fetch = require('node-fetch');
const mongo = require('mongodb');
const parser = require('fast-xml-parser');
const he = require('he');

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const options = {
  attributeNamePrefix: '@_',
  attrNodeName: 'attr', //default is 'false'
  textNodeName: '#text',
  ignoreAttributes: true,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata', //default is 'false'
  cdataPositionChar: '\\c',
  localeRange: '', //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: a => he.decode(a, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: a => he.decode(a) //default is a=>a
};

client.connect(err => {
  if (err) return;
  console.log('connected');

  const db = client.db('stl-health-hack');
  const col = db.collection('xmlbmfs');
  // col.deleteMany({});

  const cursor = db.collection('queriedbmfs').find({ URL: { $exists: true } })
  .skip(2800).limit(200);

  // const failedXMLs = [];

  cursor.toArray((err, bmfs) => {
    const xmlUrls = bmfs.map(bmf => fetch(bmf.URL).then(res => res.text()));

    Promise.all(xmlUrls)
      .then(xmls => {
        xmls.forEach(xml => {
          if (parser.validate(xml) === true) {
            const jsonObj = parser.parse(xml, options);
            col.insertOne(jsonObj);
          }
        })
      })
  });
});

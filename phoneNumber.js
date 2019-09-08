const puppeteer = require('puppeteer');
const mongo = require('mongodb');

let result = 0;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect(err => {
  if (err) {
    console.log(err);
    return;
  }

  const db = client.db('stl-health-hack');
  const col = db.collection('queriedbmfs');

  col.find({}).toArray(async (err, bmfs) => {
    for (let i = 0; i < bmfs.length; i++) {
      const bmf = bmfs[i];
      const { hours, phoneNum } = await getPhoneNumAndHours(bmf.NAME);

      const update = { $set: {} };

      if (phoneNum) {
        update.$set['PHONE_NUM'] = phoneNum;
      }

      if (hours && hours.length) {
        update.$set['HOURS'] = hours;
      }

      if (Object.keys(update.$set).length) {
        await col.updateOne({ _id: bmf._id }, update);
        console.log('Done updated: ', bmf._id);
        console.log('----------------------------------------');
      }
    }
  });
});

const formatTime = time => {
  const lastTwo = time.substr(-2);
  const timeVal = time.split(lastTwo)[0];
  const isAm = lastTwo === 'AM';

  const [hour, minute] = timeVal.split(':');

  return !!minute
    ? isAm
      ? `${hour}:${minute}`
      : `${Number(hour) + 12}:${minute}`
    : isAm
    ? `${hour}:00`
    : `${Number(hour) + 12}:00`;
};

const getHour = hour => {
  if (hour === 'Closed') {
    return '00:00-00:00';
  }

  if (hour === 'Open 24 hours') {
    return '00:00-24:00';
  }

  const [open, close] = hour.split('–');
  return `${formatTime(open)}-${formatTime(close)}`;
};

const getPhoneNumAndHours = async query => {
  console.log('----------------------------------------');
  console.log(`Getting PhoneNumber and Hours for ${query}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://google.com');

  await page.type('input.gLFyf', query);
  await page.keyboard.press(String.fromCharCode(13));
  await page.waitForNavigation();
  //   await page.waitForSelector('span[data-local-attribute="d3ph"] > span');
  await page.waitFor(2000);
  let phoneNum;
  let hours;

  const hasPhoneNode = await page.$('span[data-local-attribute="d3ph"] > span');
  if (hasPhoneNode) {
    const phoneNumberNode = await page.$eval(
      'span[data-local-attribute="d3ph"] > span',
      el => el.textContent
    );
    console.log(`Found PhoneNumber: ${phoneNumberNode}`);
    phoneNum = phoneNumberNode
      .replace('(', '')
      .replace(')', '')
      .replace(/\s/, '')
      .replace('-', '');
  }

  const hoursNode = await page.$(
    'div[data-local-attribute="d3oh"] div.h-n[jsaction="oh.handleHoursAction"]'
  );

  if (hoursNode) {
    hours = [];
    console.log(`Found Hours`);
    await page.click(
      'div[data-local-attribute="d3oh"] div.h-n[jsaction="oh.handleHoursAction"]'
    );
    const allHoursNodes = await page.$$(
      'div[data-local-attribute="d3oh"] div.a-h > table > tbody tr'
    );

    for (let i = 0; i < allHoursNodes.length; i++) {
      const node = allHoursNodes[i];
      const day = await node.$eval('td.SKNSIb', el => el.textContent);
      const hour = await node.$eval('td:last-of-type', el => el.textContent);
      hours.push({ day: day.toLowerCase(), hour: getHour(hour) });
    }
  }

  result++;
  console.log(`Already ran ${result}`);
  await page.close();
  await browser.close();
  return { phoneNum, hours };
};

// const fetch = require('node-fetch');

// const apiKey = "AIzaSyDyaiRUCNHf8JEV6GXWv0DFuecyNLPQaJQ";
// const cx = "012813650112916212198:sparh37ot0k";
// const baseUrl = "https://www.googleapis.com/customsearch/v1?key=AIzaSyDyaiRUCNHf8JEV6GXWv0DFuecyNLPQaJQ&cx=012813650112916212198:sparh37ot0k&gl=us&lr=lang_en&q={q}";

// const searchUrl = baseUrl.replace('{q}', "AAO DISASTER RELIEF FUND");

// fetch(searchUrl)
//     .then(res => res.json())
//     .then(console.log);

const puppeteer = require('puppeteer');
const mongo = require('mongodb');

let result = 0;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    const db = client.db('stl-health-hack');
    const col = db.collection('queriedbmfs');

    col.find({$or: [
        {WEBSITE: {$exists: false}},
        {WEBSITE: {$eq: "N/A"}},
        {WEBSITE: {$eq: "NONE"}},
        {WEBSITE:  {$eq: "None"}}
    ]}).toArray(async (err, bmfs) => {
        for (let i = 0; i < bmfs.length; i++) {
            const bmf = bmfs[i];
            const href = await getFirstUrl(bmf.NAME);
            if (href) {
                await col.updateOne({_id: bmf._id}, {$set: {WEBSITE: href}});
                continue;
            }
        }
    });
})

const getFirstUrl = async (query) => {
    console.log(`Getting URL for ${query}`);
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://google.com');

    await page.type("input.gLFyf", query);
    await page.keyboard.press(String.fromCharCode(13))
    await page.waitForNavigation();
    await page.waitFor(2000);
    let href = await page.$eval("div.g", el => el.firstElementChild.href);

    if (!href) {
        href = await page.$eval("div.r", el => el.firstElementChild.href);
    }

    result++;
    console.log(`Found URL: ${href}. Already ran ${result}`);
    await page.close();
    await browser.close();
    return href;
}

// (async (query) => {
//     const browser = await puppeteer.launch({headless: false});
//     const page = await browser.newPage();
//     await page.goto('https://google.com');

//     await page.type("input.gLFyf", query);
//     await page.keyboard.press(String.fromCharCode(13))
//     await page.waitForNavigation();
//     await page.waitFor(2000);
//     let href = await page.$eval("div.g", el => el.firstElementChild.href);

//     if (!href) {
//         href = await page.$eval("div.r", el => el.firstElementChild.href);
//     }

//     result++;
//     console.log(`Getting URL ${href} for ${query}. Already ran ${result}`);
//     await page.close();
//     await browser.close();
//     return href;
// })("AAO DISASTER RELIEF FUND")

const result = [];
db.queriedbmfs.deleteMany({});

const codes = db.activitycodes.find({});
const ntees = db.ntees.find({});
const codesArr = codes.map(c => c.code);
const nteesArr = ntees.map(n => n.code);

db.bmfs.find({
    $or: [
        { $and: [{ NTEE_CD: { $exists: true }, ACTIVITY: { $ne: "0" } }] },
        { NTEE_CD: { $exists: false } },
        { ACTIVITY: { $eq: "0" } }
    ]
}).forEach((it) => {
    // print(it.EIN, it.ACTIVITY, it.ACTIVITY_CODES, it.NTEE_CD);
        
    const shouldPush = (it.NTEE_CD && !it.ACTIVITY && nteesArr.some(n => it.NTEE_CD.startsWith(n)))
        || (it.ACTIVITY && !it.NTEE_CD && codesArr.some(c => it.ACTIVITY_CODES && it.ACTIVITY_CODES.includes(c)))
        || (it.ACTIVITY && it.NTEE_CD && (nteesArr.some(n => it.NTEE_CD.startsWith(n)) || codesArr.some(c => it.ACTIVITY_CODES && it.ACTIVITY_CODES.includes(c))));

    if (shouldPush) {
        result.push(it);
    }
});

db.queriedbmfs.insert(result);
db.bmfs.find({ NTEE_CD: { $exists: true }, ACTIVITY: { $ne: "0" } })
    .projection({ ACTIVITY: 1, NTEE_CD: 1 })
    .sort({ _id: -1 })

db.bmfs.find({ NTEE_CD: { $exists: false } })
    .projection({ ACTIVITY: 1 });

db.bmfs.find({ ACTIVITY: { $eq: "0" } })
    .projection({ NTEE_CD: 1 });
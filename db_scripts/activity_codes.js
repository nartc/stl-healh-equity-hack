db.bmfs.find({ACTIVITY: {$ne: "0"}}).forEach((it)=> { 
    const codes = [];
    for (let i = 0; i < 3; i++) {
        codes.push(it.ACTIVITY.substr(i * 3, 3))
    }
    db.bmfs.updateOne({_id: it._id},{$set:{ACTIVITY_CODES: codes}})
});
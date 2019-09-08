db.bmfs.find({ACTIVITY: {$ne: "0"}}).forEach((it)=> { 
    if (it.ACTIVITY.length < 9) {
        it.ACTIVITY = Array.from({length: 9 - it.ACTIVITY.length}).fill("0").join("").concat(it.ACTIVITY);
        db.bmfs.updateOne({_id: it._id},{$set:{ACTIVITY: it.ACTIVITY}})
    }
});
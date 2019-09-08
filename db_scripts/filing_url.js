const filings = db.filings.find({}).toArray();

db.queriedbmfs.find({}).forEach((it)=> { 
    const found = filings.find(f => f.EIN === it.EIN);
    
    if (found) {
        db.queriedbmfs.updateOne({_id: it._id},{$set:{URL: found.URL}})
    } else {
        db.queriedbmfs.deleteOne({_id: it._id});
    }
});
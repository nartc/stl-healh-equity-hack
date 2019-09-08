db.queriedbmfs.find({}).forEach((it)=> { 
    if (it.CONCAT_DESC) {
        db.eindescs.insertOne({EIN: it.EIN, desc: it.CONCAT_DESC})
    }
});
const categories = db.categories.find({}).toArray();

db.queriedbmfs.find({}).forEach((it)=> { 
    const found = categories.find(cat => cat.code === it.NTEE_CD);
    
    if (found) {
        db.queriedbmfs.updateOne({_id: it._id},{$set:{
            CATEGORY_DESCRIPTION: found.description,
            KEYWORDS: found.keywords
        }})
    }
});
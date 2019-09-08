db.queriedbmfs.find({}).forEach((it)=> { 
    const concatDesc = [it.MISSION_DESC, it.XML_DESC, it.CATEGORY_DESCRIPTION];
    db.queriedbmfs.updateOne({_id: it._id},{$set:{
        CONCAT_DESC: concatDesc.join(" ")
    }})
});
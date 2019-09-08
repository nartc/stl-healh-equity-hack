db.categories.find({}).forEach((it)=> { 
    let concatDesc = "";
    if (it.keywords && it.keywords.length) {
        concatDesc = concatDesc.concat(it.keywords.join(" "));
    }
    
    if (it.description) {
        concatDesc = concatDesc.concat(" ", it.description);
    }
    
    if (concatDesc) {
        db.codedescs.insertOne({code: it.code, description: concatDesc})
    }
});
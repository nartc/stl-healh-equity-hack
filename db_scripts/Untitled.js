db.queriedbmfs.find({
    "PHONE_NUM": { "$exists": true },
    "$expr": { "$gt": [ { "$strLenCP": "$PHONE_NUM" }, 10 ] } 
})
   .projection({})
   .sort({_id:-1})
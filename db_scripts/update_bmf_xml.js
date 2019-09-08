const xmls = db.xmlbmfs.find({}).toArray();

db.queriedbmfs.find({}).forEach((it)=> { 
    const found = xmls.find(xml => xml.Return.ReturnHeader.Filer.EIN === it.EIN);
    const update = {$set: {}};
    
    if (found) {
        if (found.Return.ReturnHeader.Filer.PhoneNum) {
            update.$set["PHONE_NUM"] = found.Return.ReturnHeader.Filer.PhoneNum;
        }
        
        if (found.Return.ReturnData["IRS990EZ"]) {
            if (found.Return.ReturnData["IRS990EZ"]["WebsiteAddressTxt"]) {
                update.$set["WEBSITE"] = found.Return.ReturnData["IRS990EZ"]["WebsiteAddressTxt"];
            }
            
            if (found.Return.ReturnData["IRS990EZ"]["MissionDesc"]) {
                update.$set["MISSION_DESC"] = found.Return.ReturnData["IRS990EZ"]["MissionDesc"];
            }
            
            if (found.Return.ReturnData["IRS990EZ"]["Desc"]) {
                update.$set["XML_DESC"] = found.Return.ReturnData["IRS990EZ"]["Desc"];
            }
        } else if (found.Return.ReturnData["IRS990"]) {
            if (found.Return.ReturnData["IRS990"]["WebsiteAddressTxt"]) {
                update.$set["WEBSITE"] = found.Return.ReturnData["IRS990"]["WebsiteAddressTxt"];
            }
            
            if (found.Return.ReturnData["IRS990"]["MissionDesc"]) {
                update.$set["MISSION_DESC"] = found.Return.ReturnData["IRS990"]["MissionDesc"];
            }
            
            if (found.Return.ReturnData["IRS990"]["Desc"]) {
                update.$set["XML_DESC"] = found.Return.ReturnData["IRS990"]["Desc"];
            }
        }
        
        if (Object.keys(update.$set).length) {
            db.queriedbmfs.updateOne({_id: it._id},update)    
        }
    }
});
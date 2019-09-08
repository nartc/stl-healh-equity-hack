db.bmffiltereds.find({}).forEach((it) => {
    db.bmffiltereds.updateOne({ _id: it._id }, {
        $set: {
            EIN: String(it.EIN),
            CLASSIFICATION: String(it.CLASSIFICATION),
            RULING: String(it.RULING),
            DEDUCTIBILITY: String(it.DEDUCTABILITY),
            FOUNDATION: String(it.FOUNDATION),
            ACTIVITY: String(it.ACTIVITY),
            TAX_PERIOD_x: String(it.TAX_PERIOD_x),
            TAX_PERIOD_y: String(it.TAX_PERIOD_y),
            NTEE_CD: String(it.NTEE_CD),
            OBJECT_ID: String(it.OBJECT_ID),
            DLN: String(it.DLN),
            RETURN_ID: String(it.RETURN_ID)
        }
    })
});
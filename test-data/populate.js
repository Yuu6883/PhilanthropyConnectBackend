const runner = require("./test/setup/runner");
const data = require("./data.json");

const pick = array => array[~~(Math.random() * array.length)];


runner().then(async app => {

    const follow = async (i, o) => {
        await app.db.orgs.addFollower(o, i);
        await app.db.inds.follow(i, o);
    }

    const indIDs = [];
    const orgIDS = [];

    for (const form of data.INDI) {
        const result = app.db.inds.validate(form);
        if (result.error || result.errors) console.log((result.error || result.errors).message);
        const ref = await app.db.inds.insert(app.db.inds.formToDocument(result.value));
        indIDs.push(ref.id);
    };

    for (const form of data.ORG) {
        const result = app.db.orgs.validate(form);
        if (result.error || result.errors) console.log((result.error || result.errors).message);
        const ref = await app.db.orgs.insert(app.db.orgs.formToDocument(result.value));
        orgIDS.push(ref.id);
    };

    for (const event of data.EVENT) {
        event.date = new Date(event.date).getTime();
        const result = app.db.events.validate(event);
        if (result.error || result.errors) console.log((result.error || result.errors).message);
        const doc = app.db.events.formToDocument(result.value);
        const org = pick(orgIDS);
        doc.owner = org;
        const ref = await app.db.events.insert(doc);
        await app.db.orgs.addEvent(org, ref.id);
    };

    for (const i of indIDs) {
        const n = Math.random() * 10;
        for (let _ = 0; _ < n; _++) {
            await follow(i, pick(orgIDS));
        }
    }
});
const cds = require("@sap/cds");

module.exports = async (srv) => {
    const db = await cds.connect.to("db");
    const { Books } = db.entities;

    srv.after("READ", "Books", (each) => {
        if (each.stock > 100) {
            each.title += " (discount)";
        }
    });
};
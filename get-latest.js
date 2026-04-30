const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./biz.db');

db.get("SELECT * FROM consultations ORDER BY id DESC LIMIT 1", (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(JSON.stringify(row, null, 2));
  db.close();
});

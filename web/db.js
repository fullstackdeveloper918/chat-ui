import mysql from "mysql2";


let db_con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chatbot_ui",
});

db_con.connect((err) => {
  if (err) {
    console.error("Database Connection Failed !!!", err);
  } else {
    console.error("connected to Database");
  }
});

export default db_con;

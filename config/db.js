// db.js
const oracledb = require("oracledb");

// 결과를 객체 형태로 받기 위해 설정 (설정추가 11월20일)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// db setting.
const dbConfig = {
  user: "baseball",
  password: "baseball",
  connectString: "localhost:1521/xe",
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log("db 접속 성공");
    return connection; // connection반환
  } catch (err) {
    console.log("db 접속 에러: ", err);
    throw err;
  }
}

module.exports = { getConnection }; // export 다른 js 사용

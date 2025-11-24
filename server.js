const express = require("express");
const db = require("./config/db.js");
const cors = require("cors");
const path = require("path"); // path 모듈 추가 11월20일.

const app = express(); // 웹서버기능.
const port = 3000;

app.use(cors()); // cors 원칙.
app.use(express.json()); // body-parser json 처리.
app.use(express.urlencoded({ extended: true })); // key=val&key=val&.....

// public 폴더 내의 파일들을 / 경로를 통해 접근 가능하게 합니다.(설정추가 11월20일)
app.use(express.static(path.join(__dirname, "public")));

// url : 실행함수 => 라우팅.
app.get("/", (req, res) => {
  res.send("/ 호출됨.");
});

app.post("/api/signup", async (req, res) => {
  let connection;

  try {
    console.log("받은 데이터:", req.body);
    const { user_id, password, my_team } = req.body; // 객체 구조 분해 할당

    console.log("아이디 ", user_id);
    console.log("비밀번호 ", password); // 추가
    console.log("팀 ", my_team);

    // DB 연결
    connection = await db.getConnection();

    // 중복 아이디 체크
    const checkResult = await connection.execute(
      `SELECT user_id FROM baseball_user WHERE user_id = :user_id`,
      { user_id: user_id }
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 아이디입니다.",
      });
    }

    // 회원가입
    await connection.execute(
      `INSERT INTO baseball_user (user_id, password, my_team)
       VALUES (:user_id, :password, :my_team)`,
      { user_id, password, my_team },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "회원가입이 완료되었습니다.",
    });
  } catch (err) {
    console.error("회원가입 오류: ", err);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        //console.log("db 연결 종료");
      } catch (err) {
        //console.error("연결 종료 오류: ", err);
      }
    }
  }
});

app.post("/api/login", async (req, res) => {
  let connection;

  try {
    console.log(req.body);
    const { user_id, password } = req.body;

    connection = await db.getConnection();

    // 존재하는 아이디인지 확인
    const checkUser = await connection.execute(
      `SELECT user_id, password FROM baseball_user 
       WHERE user_id = :user_id`,
      { user_id: user_id }
    );
    console.log("아이디 확인 결과:", checkUser.rows);

    if (checkUser.rows.length === 0) {
      await connection.close();
      return res.status(401).json({
        success: false,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }

    // 아이디와 비밀번호가 일치하는 사용자 조회
    const result = await connection.execute(
      `SELECT user_id, my_team
       FROM baseball_user
       WHERE user_id = :user_id AND password = :password`,
      {
        user_id: user_id,
        password: password,
      }
    );
    console.log("쿼리 결과: ", result.rows);

    // 결과 있으면 로그인 성공
    if (result.rows.length > 0) {
      const user = result.rows[0];

      res.json({
        success: true,
        message: "로그인 성공!",
        user: {
          user_id: user.USER_ID,
          my_team: user.MY_TEAM,
        },
      });
    } else {
      // 결과 없으면 로그인 실패
      res.status(401).json({
        success: false,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB 연결 종료");
      } catch (err) {
        console.error("연결 종료 오류:", err);
      }
    }
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Express 서버가 실행중...http://localhost:${port}`);
});

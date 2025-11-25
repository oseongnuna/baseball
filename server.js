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
  res.redirect("/login.html");
});

// 회원가입
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

// 로그인
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

// 글 작성
app.post("/api/write", async (req, res) => {
  let connection;

  try {
    console.log(req.body);
    const {
      user_id,
      game_date,
      stadium,
      home_team,
      away_team,
      home_starter,
      away_starter,
      home_score,
      away_score,
      game_result,
      mvp,
      game_detail,
    } = req.body; // 구조 분해 할당

    connection = await db.getConnection();

    const result = await connection.execute(
      `INSERT INTO baseball_record 
     (user_id, game_date, stadium, home_team, away_team, 
      home_starter, away_starter, home_score, away_score, 
      game_result, mvp, game_detail)
     VALUES 
     (:user_id, TRUNC(TO_DATE(:game_date, 'YYYY-MM-DD')), :stadium, :home_team, :away_team,
      :home_starter, :away_starter, :home_score, :away_score,
      :game_result, :mvp, :game_detail)`,
      {
        user_id,
        game_date,
        stadium,
        home_team,
        away_team,
        home_starter, // NULL 가능
        away_starter, // NULL 가능
        home_score,
        away_score,
        game_result,
        mvp, // NULL 가능
        game_detail, // NULL 가능
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "기록이 저장되었습니다.",
    });
  } catch (err) {
    console.error("기록 저장 실패:", err);
    res.status(500).json({
      success: false,
      message: "기록 저장에 실패했습니다.",
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

// 목록 조회
app.get("/api/game-records", async (req, res) => {
  let connection;

  try {
    // 쿼리 파라미터에서 user_id 가져오기
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id가 필요합니다.",
      });
    }

    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT * FROM baseball_record
       WHERE user_id = :user_id 
      ORDER BY game_date DESC, ID DESC`,
      { user_id }
    );

    // console.log("조회된 데이터:", result.rows);

    res.json({
      success: true,
      records: result.rows,
    });
  } catch (error) {
    console.error("에러:", error);
    res.status(500).json({
      success: false,
      message: "조회 실패",
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// 게시글 삭제
app.delete("/api/game-records/:id", async (req, res) => {
  let connection;

  const { id } = req.params;
  const { user_id } = req.query;

  try {
    // user_id 확인
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id가 필요합니다.",
      });
    }

    connection = await db.getConnection();

    // 본인의 기록만 삭제
    const result = await connection.execute(
      `DELETE FROM baseball_record 
       WHERE ID = :id AND user_id = :user_id`,
      { id, user_id },
      { autoCommit: true }
    );

    // 삭제된 행이 없으면 (기록이 없거나 본인 기록이 아님)
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 기록을 찾을 수 없거나 권한이 없습니다.",
      });
    }

    console.log(`ID ${id} 삭제 완료`);

    res.json({
      success: true,
      message: "기록이 삭제되었습니다.",
    });
  } catch (err) {
    console.error("삭제 실패:", err);
    res.status(500).json({
      success: false,
      message: "삭제에 실패했습니다.",
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

// 게시글 수정
app.put("/api/game-records/:id", async (req, res) => {
  let connection;

  const { id } = req.params;
  const {
    user_id,
    game_date,
    stadium,
    home_team,
    away_team,
    home_starter,
    away_starter,
    home_score,
    away_score,
    game_result,
    mvp,
    game_detail,
  } = req.body;

  try {
    // user_id 확인
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id가 필요합니다.",
      });
    }

    connection = await db.getConnection();

    // 본인의 기록만 수정
    const result = await connection.execute(
      `UPDATE baseball_record 
       SET game_date = TRUNC(TO_DATE(:game_date, 'YYYY-MM-DD')),
           stadium = :stadium,
           home_team = :home_team,
           away_team = :away_team,
           home_starter = :home_starter,
           away_starter = :away_starter,
           home_score = :home_score,
           away_score = :away_score,
           game_result = :game_result,
           mvp = :mvp,
           game_detail = :game_detail
       WHERE ID = :id AND user_id = :user_id`,
      {
        game_date,
        stadium,
        home_team,
        away_team,
        home_starter,
        away_starter,
        home_score,
        away_score,
        game_result,
        mvp,
        game_detail,
        id,
        user_id,
      },
      { autoCommit: true }
    );

    // 수정된 행이 없으면 (기록이 없거나 본인 기록이 아님)
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "수정할 기록을 찾을 수 없거나 권한이 없습니다.",
      });
    }

    console.log(`ID ${id} 수정 완료`);

    res.json({
      success: true,
      message: "기록이 수정되었습니다.",
    });
  } catch (err) {
    console.error("수정 실패:", err);
    res.status(500).json({
      success: false,
      message: "수정에 실패했습니다.",
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

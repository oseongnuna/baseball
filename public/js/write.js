// 페이지 로드 시 수정 모드 확인
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get("id");

  if (recordId) {
    // 수정 모드
    document.querySelector("h1").textContent = "⚾ 직관 기록 수정";
    await loadRecordForEdit(recordId);
  } else {
    // 신규 작성 모드 - 오늘 날짜 자동 설정
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("game_date").value = today;
  }
});

// 수정할 데이터 불러오기
async function loadRecordForEdit(recordId) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.user_id) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(`/api/game-records?user_id=${user.user_id}`);
    const data = await response.json();

    if (data.success) {
      const record = data.records.find((r) => r.ID == recordId);
      if (record) {
        fillFormWithData(record);
      } else {
        alert("해당 기록을 찾을 수 없습니다.");
        window.location.href = "board.html";
      }
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    alert("데이터를 불러오는데 실패했습니다.");
    window.location.href = "board.html";
  }
}

// 폼에 데이터 채우기
// fillFormWithData 함수 수정
function fillFormWithData(record) {
  // 날짜 처리 수정
  const date = new Date(record.GAME_DATE);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  document.getElementById("game_date").value = `${year}-${month}-${day}`;

  document.getElementById("stadium").value = record.STADIUM;
  document.getElementById("home_team").value = record.HOME_TEAM;
  document.getElementById("away_team").value = record.AWAY_TEAM;
  document.getElementById("home_starter").value = record.HOME_STARTER || "";
  document.getElementById("away_starter").value = record.AWAY_STARTER || "";
  document.getElementById("home_score").value = record.HOME_SCORE;
  document.getElementById("away_score").value = record.AWAY_SCORE;

  // 라디오 버튼
  const resultRadios = document.getElementsByName("game_result");
  resultRadios.forEach((radio) => {
    if (radio.value === record.GAME_RESULT) {
      radio.checked = true;
    }
  });

  document.getElementById("mvp").value = record.MVP || "";
  document.getElementById("game_detail").value = record.GAME_DETAIL || "";

  // 폼에 ID 저장 (수정 시 사용)
  document.getElementById("gameRecordForm").dataset.recordId = record.ID;
}

// 폼 제출 처리
document
  .getElementById("gameRecordForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    // localStorage에서 user 정보 가져오기
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user: ", user);
    // 로그인 확인
    if (!user || !user.user_id) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    // 폼 데이터 수집
    const formData = {
      user_id: user.user_id,
      game_date: document.getElementById("game_date").value,
      stadium: document.getElementById("stadium").value,
      home_team: document.getElementById("home_team").value,
      away_team: document.getElementById("away_team").value,
      home_starter: document.getElementById("home_starter").value,
      away_starter: document.getElementById("away_starter").value,
      home_score: document.getElementById("home_score").value,
      away_score: document.getElementById("away_score").value,
      game_result: document.querySelector('input[name="game_result"]:checked')
        .value,
      mvp: document.getElementById("mvp").value,
      game_detail: document.getElementById("game_detail").value,
    };

    // 수정 모드 확인
    const recordId = document.getElementById("gameRecordForm").dataset.recordId;

    if (recordId) {
      // 수정 모드
      await updateRecord(recordId, formData);
    } else {
      // 등록 모드
      await createRecord(formData);
    }
  });

// 유효성 검사
function validateForm() {
  let isValid = true;

  // 모든 에러 메시지 초기화
  document.querySelectorAll(".error-message").forEach((el) => {
    el.style.display = "none";
  });

  // 경기 날짜
  const game_date = document.getElementById("game_date");
  if (!game_date.value) {
    showError("gameDateError");
    isValid = false;
  }

  // 구장
  const stadium = document.getElementById("stadium");
  if (!stadium.value) {
    showError("stadiumError");
    isValid = false;
  }

  // 홈 팀
  const home_team = document.getElementById("home_team");
  if (!home_team.value) {
    showError("homeTeamError");
    isValid = false;
  }

  // 어웨이 팀
  const away_team = document.getElementById("away_team");
  if (!away_team.value) {
    showError("awayTeamError");
    isValid = false;
  }

  // 같은 팀 선택 방지
  if (
    home_team.value &&
    away_team.value &&
    home_team.value === away_team.value
  ) {
    showError("awayTeamError");
    document.getElementById("awayTeamError").textContent =
      "홈 팀과 다른 팀을 선택해주세요.";
    isValid = false;
  }

  // 최종 스코어
  const home_score = document.getElementById("home_score");
  const away_score = document.getElementById("away_score");
  if (home_score.value === "" || away_score.value === "") {
    showError("finalScoreError");
    isValid = false;
  }

  // 경기 결과
  const game_result = document.querySelector(
    'input[name="game_result"]:checked'
  );
  if (!game_result) {
    showError("gameResultError");
    isValid = false;
  }

  return isValid;
}

// 에러 메시지 표시
function showError(errorId) {
  document.getElementById(errorId).style.display = "block";
}

// 새 기록 생성
async function createRecord(data) {
  console.log("새 기록 작성:", data);

  try {
    const response = await fetch("/api/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("result:", result);

    if (result.success) {
      alert("기록이 저장되었습니다!");
      window.location.href = "board.html";
    } else {
      alert("저장에 실패했습니다.");
    }
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장에 실패했습니다.");
  }
}

// 기록 수정
async function updateRecord(id, data) {
  console.log("기록 수정:", id, data);

  try {
    const response = await fetch(`/api/game-records/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("result:", result);

    if (result.success) {
      alert("기록이 수정되었습니다!");
      window.location.href = "board.html";
    } else {
      alert("수정에 실패했습니다.");
    }
  } catch (error) {
    console.error("수정 실패:", error);
    alert("수정 중 오류가 발생했습니다.");
  }
}

// 취소 버튼
document
  .getElementById("gameRecordForm")
  .addEventListener("reset", function (e) {
    e.preventDefault();
    if (confirm("작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.")) {
      window.location.href = "board.html";
    }
  });

// 실시간 유효성 검사
document.getElementById("away_team").addEventListener("change", function () {
  const home_team = document.getElementById("home_team").value;
  if (home_team && this.value === home_team) {
    showError("awayTeamError");
    document.getElementById("awayTeamError").textContent =
      "홈 팀과 다른 팀을 선택해주세요.";
  } else {
    document.getElementById("awayTeamError").style.display = "none";
  }
});

// board.js

// 페이지 로드 시 데이터 불러오기
document.addEventListener("DOMContentLoaded", async () => {
  await loadGameRecords();
});

// 야구 관람 기록 데이터 불러오기
async function loadGameRecords() {
  try {
    // localStorage에서 user 정보 가져오기
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user: ", user);
    // 로그인 확인
    if (!user || !user.user_id) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    // 마이팀 표시
    if (user.my_team) {
      document.querySelector(".user-info").textContent =
        "MY TEAM: " + user.my_team;
    }

    const response = await fetch(`/api/game-records?user_id=${user.user_id}`);
    const data = await response.json();
    console.log(data);

    if (data.success && data.records.length > 0) {
      renderRecords(data.records);
      updateTotalCount(data.records.length);
      hideEmptyMessage();
    } else {
      showEmptyMessage();
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    showEmptyMessage();
  }
}

// records를 전역 변수로 저장
let currentRecords = [];

// renderRecords 함수 수정
function renderRecords(records) {
  currentRecords = records; // 전역에 저장
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  records.forEach((record, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${records.length - index}</td>
      <td>${formatDate(record.GAME_DATE)}</td>
      <td>${record.STADIUM}</td>
      <td>${record.HOME_TEAM} vs ${record.AWAY_TEAM}</td>
      <td>${record.HOME_SCORE}:${record.AWAY_SCORE}</td>
      <td>
        <span class="result-badge ${getResultClass(record.GAME_RESULT)}">
          ${record.GAME_RESULT}
        </span>
      </td>
      <td>${record.MVP || "-"}</td>
      <td><button class="btn btn-small btn-edit" onclick="editRecord(${index})">수정</button></td>
      <td>
        <button class="btn btn-small btn-delete" onclick="deleteRecord(${
          record.ID
        })">
          삭제
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 날짜 포맷팅 (YYYY-MM-DD)
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 결과에 따른 CSS 클래스 반환
function getResultClass(result) {
  switch (result) {
    case "승":
      return "win";
    case "패":
      return "lose";
    case "무":
      return "draw";
    default:
      return "";
  }
}

// 총 건수 업데이트
function updateTotalCount(count) {
  const countElement = document.querySelector(".total-count strong");
  if (countElement) {
    countElement.textContent = count;
  }
}

// 빈 메시지 표시
function showEmptyMessage() {
  const emptyMessage = document.querySelector(".empty-message");
  const tbody = document.querySelector("table tbody");

  if (emptyMessage) {
    emptyMessage.style.display = "block";
  }
  if (tbody) {
    tbody.innerHTML = "";
  }
  updateTotalCount(0);
}

// 빈 메시지 숨기기
function hideEmptyMessage() {
  const emptyMessage = document.querySelector(".empty-message");
  if (emptyMessage) {
    emptyMessage.style.display = "none";
  }
}

// 기록 삭제
async function deleteRecord(id) {
  if (!confirm("정말 이 기록을 삭제하시겠습니까?")) {
    return;
  }

  try {
    // localStorage에서 user 정보 가져오기
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user: ", user);
    // 로그인 확인
    if (!user || !user.user_id) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }
    const response = await fetch(
      `/api/game-records/${id}?user_id=${user.user_id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (data.success) {
      alert("삭제되었습니다.");
      await loadGameRecords();
    } else {
      alert("삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("삭제 실패:", error);
    alert("삭제 중 오류가 발생했습니다.");
  }
}

// 수정 함수 추가 (파일 맨 아래에)
function editRecord(index) {
  const record = currentRecords[index];
  // URL 파라미터로 ID만 전달
  window.location.href = `write.html?id=${record.ID}`;
}

// 로그아웃 기능
function logout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    // user 정보 삭제
    localStorage.removeItem("user");

    alert("로그아웃 되었습니다.");
    window.location.href = "login.html";
  }
}

// 로그아웃 버튼에 이벤트 리스너 추가
document.querySelector(".header-right .btn").addEventListener("click", logout);

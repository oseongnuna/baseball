// 에러 메시지 표시 함수
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.add("show");
}

// 에러 메시지 숨김 함수
function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.classList.remove("show");
}

// 모든 에러 메시지 초기화
function clearAllErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => error.classList.remove("show"));
}

// 유효성 검사
function validateForm() {
  clearAllErrors();
  let isValid = true;

  const user_id = document.getElementById("user_id").value.trim();
  const password = document.getElementById("password").value;

  // 아이디 검사
  if (user_id === "") {
    showError("userIdError", "아이디를 입력해주세요.");
    isValid = false;
  } else if (user_id.length < 4) {
    showError("userIdError", "아이디는 4자 이상이어야 합니다.");
    isValid = false;
  }

  // 비밀번호 검사
  if (password === "") {
    showError("passwordError", "비밀번호를 입력해주세요.");
    isValid = false;
  } else if (password.length < 6) {
    showError("passwordError", "비밀번호는 6자 이상이어야 합니다.");
    isValid = false;
  }

  return isValid;
}

const form = document.getElementById("loginForm");

// 폼 제출 이벤트
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("로그인 시도!");

  if (validateForm()) {
    const formData = {
      user_id: document.getElementById("user_id").value.trim(),
      password: document.getElementById("password").value,
    };
    console.log(formData);

    // API 호출
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        alert(result.message);

        // 로그인 정보를 localStorage에 저장
        localStorage.setItem("user", JSON.stringify(result.user));

        // 목록으로 이동
        window.location.href = "board.html";
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.log("오류: ", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  }
});

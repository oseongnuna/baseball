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
  const passwordConfirm = document.getElementById("passwordConfirm").value;
  const my_team = document.querySelector('select[name="my_team"]');

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

  // 비밀번호 확인 검사
  if (passwordConfirm === "") {
    showError("passwordConfirmError", "비밀번호 확인을 입력해주세요.");
    isValid = false;
  } else if (password !== passwordConfirm) {
    showError("passwordConfirmError", "비밀번호가 일치하지 않습니다.");
    isValid = false;
  }

  // 마이팀 선택 검사
  if (my_team.value === "") {
    showError("myteamError", "마이팀을 선택해주세요.");
    isValid = false;
  }

  return isValid;
}

const form = document.getElementById("signupForm");

// 폼 제출 이벤트
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("폼 제출 시작!");

  if (validateForm()) {
    const formData = {
      user_id: document.getElementById("user_id").value.trim(),
      password: document.getElementById("password").value,
      my_team: document.getElementById("my_team").value,
    };

    console.log(formData);

    // 여기에 실제 회원가입 API 호출 로직 추가
    try {
      // API 호출
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        window.location.href = "login.html";
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("오류: ", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  }
});

// 실시간 유효성 검사 (선택사항)
document.getElementById("user_id").addEventListener("blur", function () {
  const user_id = this.value.trim();
  if (user_id && user_id.length < 4) {
    showError("userIdError", "아이디는 4자 이상이어야 합니다.");
  } else {
    hideError("userIdError");
  }
});

document
  .getElementById("passwordConfirm")
  .addEventListener("input", function () {
    const password = document.getElementById("password").value;
    const passwordConfirm = this.value;
    if (passwordConfirm && password !== passwordConfirm) {
      showError("passwordConfirmError", "비밀번호가 일치하지 않습니다.");
    } else {
      hideError("passwordConfirmError");
    }
  });

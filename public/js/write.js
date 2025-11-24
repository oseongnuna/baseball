// 페이지 로드 시 오늘 날짜 자동 설정
window.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('game_date').value = today;
});

// 폼 제출 처리
document.getElementById('gameRecordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
        return;
    }

    // 폼 데이터 수집
    const formData = {
        game_date: document.getElementById('game_date').value,
        stadium: document.getElementById('stadium').value,
        home_team: document.getElementById('home_team').value,
        away_team: document.getElementById('away_team').value,
        home_starter: document.getElementById('home_starter').value,
        away_starter: document.getElementById('away_starter').value,
        home_score: document.getElementById('home_score').value,
        away_score: document.getElementById('away_score').value,
        finalScore: document.getElementById('home_score').value + ':' + document.getElementById('away_score').value,
        game_result: document.querySelector('input[name="game_result"]:checked').value,
        mvp: document.getElementById('mvp').value,
        game_detail: document.getElementById('game_detail').value
    };

    // 서버로 전송
    createRecord(formData);
});

// 유효성 검사
function validateForm() {
    let isValid = true;

    // 모든 에러 메시지 초기화
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });

    // 경기 날짜
    const game_date = document.getElementById('game_date');
    if (!game_date.value) {
        showError('gameDateError');
        isValid = false;
    }

    // 구장
    const stadium = document.getElementById('stadium');
    if (!stadium.value) {
        showError('stadiumError');
        isValid = false;
    }

    // 홈 팀
    const home_team = document.getElementById('home_team');
    if (!home_team.value) {
        showError('homeTeamError');
        isValid = false;
    }

    // 어웨이 팀
    const away_team = document.getElementById('away_team');
    if (!away_team.value) {
        showError('awayTeamError');
        isValid = false;
    }

    // 같은 팀 선택 방지
    if (home_team.value && away_team.value && home_team.value === away_team.value) {
        showError('awayTeamError');
        document.getElementById('awayTeamError').textContent = '홈 팀과 다른 팀을 선택해주세요.';
        isValid = false;
    }

    // 최종 스코어
    const home_score = document.getElementById('home_score');
    const away_score = document.getElementById('away_score');
    if (home_score.value === '' || away_score.value === '') {
        showError('finalScoreError');
        isValid = false;
    }

    // 경기 결과
    const game_result = document.querySelector('input[name="game_result"]:checked');
    if (!game_result) {
        showError('gameResultError');
        isValid = false;
    }

    return isValid;
}

// 에러 메시지 표시
function showError(errorId) {
    document.getElementById(errorId).style.display = 'block';
}

// 새 기록 생성
function createRecord(data) {
    console.log('새 기록 작성:', data);
    
    // TODO: 백엔드 연동 시 아래 주석 해제
    // fetch('/api/records', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(result => {
    //     alert('기록이 저장되었습니다!');
    //     window.location.href = 'board.html';
    // })
    // .catch(error => {
    //     console.error('저장 실패:', error);
    //     alert('저장에 실패했습니다.');
    // });

    // 임시 처리
    alert('기록이 저장되었습니다!');
    // window.location.href = 'board.html';
}

// 취소 버튼
document.getElementById('gameRecordForm').addEventListener('reset', function(e) {
    e.preventDefault();
    if (confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
        window.location.href = 'board.html';
    }
});

// 실시간 유효성 검사
document.getElementById('away_team').addEventListener('change', function() {
    const home_team = document.getElementById('home_team').value;
    if (home_team && this.value === home_team) {
        showError('awayTeamError');
        document.getElementById('awayTeamError').textContent = '홈 팀과 다른 팀을 선택해주세요.';
    } else {
        document.getElementById('awayTeamError').style.display = 'none';
    }
});
// board.js

// 페이지 로드 시 데이터 불러오기
document.addEventListener('DOMContentLoaded', async () => {
  await loadGameRecords();
});

// 야구 관람 기록 데이터 불러오기
async function loadGameRecords() {
  try {
    // TODO: 실제 API 엔드포인트로 교체 필요
    const response = await fetch('/api/game-records');
    const data = await response.json();
    
    if (data.success && data.records.length > 0) {
      renderRecords(data.records);
      updateTotalCount(data.records.length);
      hideEmptyMessage();
    } else {
      showEmptyMessage();
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    // 에러 발생 시 빈 메시지 표시
    showEmptyMessage();
  }
}

// 테이블에 데이터 렌더링
function renderRecords(records) {
  const tbody = document.querySelector('table tbody');
  
  // 기존 tbody가 없으면 생성
  if (!tbody) {
    const newTbody = document.createElement('tbody');
    document.querySelector('table').appendChild(newTbody);
  }
  
  const tbodyElement = document.querySelector('table tbody');
  tbodyElement.innerHTML = ''; // 기존 내용 초기화
  
  records.forEach((record, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${records.length - index}</td>
      <td>${formatDate(record.game_date)}</td>
      <td>${record.stadium}</td>
      <td>${record.home_team} vs ${record.away_team}</td>
      <td>${record.finalScore}</td>
      <td>
        <span class="result-badge ${getResultClass(record.game_result)}">
          ${record.game_result}
        </span>
      </td>
      <td>${record.mvp || '-'}</td>
      <td>
        <button class="btn btn-small btn-delete" onclick="deleteRecord(${record.id})">
          삭제
        </button>
      </td>
    `;
    
    tbodyElement.appendChild(tr);
  });
}

// 날짜 포맷팅 (YYYY-MM-DD)
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 결과에 따른 CSS 클래스 반환
function getResultClass(result) {
  switch(result) {
    case '승': return 'win';
    case '패': return 'lose';
    case '무': return 'draw';
    default: return '';
  }
}

// 총 건수 업데이트
function updateTotalCount(count) {
  const countElement = document.querySelector('.total-count strong');
  if (countElement) {
    countElement.textContent = count;
  }
}

// 빈 메시지 표시
function showEmptyMessage() {
  const emptyMessage = document.querySelector('.empty-message');
  const tbody = document.querySelector('table tbody');
  
  if (emptyMessage) {
    emptyMessage.style.display = 'block';
  }
  if (tbody) {
    tbody.innerHTML = '';
  }
  updateTotalCount(0);
}

// 빈 메시지 숨기기
function hideEmptyMessage() {
  const emptyMessage = document.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.style.display = 'none';
  }
}

// 기록 삭제
async function deleteRecord(id) {
  // 삭제 확인
  if (!confirm('정말 이 기록을 삭제하시겠습니까?')) {
    return;
  }
  
  try {
    // TODO: 실제 API 엔드포인트로 교체 필요
    const response = await fetch(`/api/game-records/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('삭제되었습니다.');
      // 목록 새로고침
      await loadGameRecords();
    } else {
      alert('삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

// ========================================
// 아래는 실제 DB 연결 전 테스트용 코드
// ========================================

// 테스트용 더미 데이터 (전역 변수로 변경하여 삭제 테스트 가능)
let mockRecords = [
  {
    id: 1,
    game_date: '2024-05-15',
    stadium: '잠실야구장',
    home_team: 'LG',
    away_team: '두산',
    home_starter: '임찬규',
    away_starter: '곽빈',
    home_score: '5',
    away_score: '3',
    finalScore: '5:3',
    game_result: '승',
    mvp: '홍창기',
    game_detail: '9회말 역전 홈런으로 짜릿한 승리!'
  },
  {
    id: 2,
    game_date: '2024-05-10',
    stadium: '수원KT위즈파크',
    home_team: 'KT',
    away_team: '삼성',
    home_score: '2',
    away_score: '4',
    finalScore: '2:4',
    game_result: '패',
    mvp: '김선빈'
  },
  {
    id: 3,
    game_date: '2024-04-28',
    stadium: '고척스카이돔',
    home_team: '키움',
    away_team: 'NC',
    home_score: '3',
    away_score: '3',
    finalScore: '3:3',
    game_result: '무',
    mvp: '-'
  },
  {
    id: 4,
    game_date: '2024-04-20',
    stadium: 'SSG랜더스필드',
    home_team: 'SSG',
    away_team: '롯데',
    home_score: '7',
    away_score: '2',
    finalScore: '7:2',
    game_result: '승',
    mvp: '최정'
  },
  {
    id: 5,
    game_date: '2024-04-05',
    stadium: '대구삼성라이온즈파크',
    home_team: '삼성',
    away_team: '한화',
    home_score: '1',
    away_score: '3',
    finalScore: '1:3',
    game_result: '패',
    mvp: '문동주'
  }
];

// 테스트 모드: 실제 API 대신 더미 데이터 사용
async function loadGameRecords() {
  try {
    // 실제 API 호출 (주석 처리)
    // const response = await fetch('/api/game-records');
    // const data = await response.json();
    
    // 테스트용 더미 데이터 사용
    await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
    const data = {
      success: true,
      records: mockRecords
    };
    
    if (data.success && data.records.length > 0) {
      renderRecords(data.records);
      updateTotalCount(data.records.length);
      hideEmptyMessage();
    } else {
      showEmptyMessage();
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    showEmptyMessage();
  }
}

// 테스트용 삭제 함수
async function deleteRecord(id) {
  if (!confirm('정말 이 기록을 삭제하시겠습니까?')) {
    return;
  }
  
  try {
    // 실제 API 호출 (주석 처리)
    // const response = await fetch(`/api/game-records/${id}`, {
    //   method: 'DELETE'
    // });
    // const data = await response.json();
    
    // 테스트용: 더미 데이터에서 삭제
    await new Promise(resolve => setTimeout(resolve, 300)); // 삭제 시뮬레이션
    mockRecords = mockRecords.filter(record => record.id !== id);
    const data = { success: true };
    
    if (data.success) {
      alert('삭제되었습니다.');
      await loadGameRecords();
    } else {
      alert('삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
}
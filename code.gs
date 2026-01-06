// ============================================
// GEM (Geo Econo Map) - Claude API 버전
// code.gs 파일
// ============================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('GEM - Geo Econo Map')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Claude API를 호출하여 경제 데이터 가져오기
 * @param {string} apiKey - Claude API 키
 * @param {string} countryName - 국가 이름
 * @param {string} metricName - 경제 지표 이름
 * @return {object} 경제 데이터 객체
 */
function fetchEconomicData(apiKey, countryName, metricName) {
  try {
    // Claude API 엔드포인트
    var url = 'https://api.anthropic.com/v1/messages';
    
    // API 요청 프롬프트
    var prompt = countryName + '의 최신 ' + metricName + ' 데이터를 다음 형식의 JSON으로만 답변해줘. 다른 설명은 절대 포함하지 마:\n' +
      '{\n' +
      '  "value": "실제 수치값",\n' +
      '  "unit": "단위 (%, 조 달러 등)",\n' +
      '  "year": "데이터 연도",\n' +
      '  "trend": "증가 또는 감소",\n' +
      '  "description": "한 줄 설명"\n' +
      '}';
    
    // Claude API 요청 페이로드
    var payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    // API 호출 옵션
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    // API 호출
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    
    // 응답 확인
    if (responseCode !== 200) {
      throw new Error('API 호출 실패: ' + responseCode + ' - ' + response.getContentText());
    }
    
    // 응답 파싱
    var data = JSON.parse(response.getContentText());
    
    if (data.content && data.content[0]) {
      var text = data.content[0].text;
      
      // JSON 추출 (```json 등 제거)
      var cleanText = text.replace(/```json|```/g, '').trim();
      var economicData = JSON.parse(cleanText);
      
      return {
        success: true,
        data: economicData
      };
    } else {
      throw new Error('데이터를 찾을 수 없습니다');
    }
    
  } catch (error) {
    Logger.log('에러: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 테스트 함수 (디버깅용)
 */
function testAPI() {
  var apiKey = 'YOUR_CLAUDE_API_KEY_HERE'; // 테스트용 API 키
  var result = fetchEconomicData(apiKey, '대한민국', 'GDP');
  Logger.log(result);
}

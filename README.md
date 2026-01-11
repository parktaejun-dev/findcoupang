# 쿠팡 파트너스 & 제휴 링크 감지기

쿠팡 파트너스 링크와 대가성/제휴 고지 문구 근처의 외부 링크를 자동으로 감지하여 시각적 배지로 표시하는 크롬 확장 프로그램입니다.

## 🎯 주요 기능

- **🔴 쿠팡 링크 감지**: 쿠팡 파트너스 링크를 빨간색 배지로 표시
- **🟡 고지 문구 링크 감지**: 대가성/제휴 고지 문구가 있는 블록 내의 외부 링크를 노란색 배지로 표시
- **⚡ 초고속 성능**: DOM만 사용하여 네트워크 요청 없이 즉시 작동
- **🔒 프라이버시 보호**: 어떤 데이터도 외부로 전송하지 않음
- **🔄 동적 콘텐츠 지원**: 무한 스크롤 및 동적으로 추가되는 링크 자동 감지

## 🚀 설치 방법

### 1. 파일 다운로드
이 저장소를 클론하거나 다운로드합니다.

```bash
git clone <repository-url>
cd findcoupang
```

### 2. 아이콘 생성 (선택사항)

현재 SVG 아이콘이 제공됩니다. PNG 아이콘을 생성하려면:

**방법 A: 온라인 변환기 사용**
1. https://cloudconvert.com/svg-to-png 방문
2. `icons/icon.svg` 파일 업로드
3. 16x16, 48x48, 128x128 크기로 각각 변환
4. `icon16.png`, `icon48.png`, `icon128.png`로 저장

**방법 B: ImageMagick 사용 (Linux/Mac)**
```bash
# ImageMagick 설치 (Ubuntu/Debian)
sudo apt-get install imagemagick

# 또는 (Mac)
brew install imagemagick

# PNG 생성
cd icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

**방법 C: Inkscape 사용**
```bash
# Inkscape 설치 (Ubuntu/Debian)
sudo apt-get install inkscape

# PNG 생성
cd icons
inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

**방법 D: 브라우저 사용 (가장 간단)**
1. Chrome에서 `icons/icon.svg` 파일 열기
2. 개발자 도구 열기 (F12)
3. Console에서 실행:
```javascript
// 각 크기별로 실행
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, size, size);
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };
  img.src = 'icon.svg';
});
```

### 3. Chrome에 로드

1. **Chrome 열기**

2. **확장 프로그램 페이지 이동**
   - 주소창에 `chrome://extensions/` 입력
   - 또는 메뉴 > 도구 더보기 > 확장 프로그램

3. **개발자 모드 활성화**
   - 우측 상단의 "개발자 모드" 토글 스위치 ON

4. **압축해제된 확장 프로그램 로드**
   - "압축해제된 확장 프로그램을 로드합니다" 버튼 클릭
   - `findcoupang` 폴더 선택

5. **확인**
   - 확장 프로그램 목록에 "쿠팡 파트너스 & 제휴 링크 감지기"가 표시되면 설치 완료

## 📖 사용 방법

설치 후 자동으로 작동합니다. 별도의 설정이나 클릭이 필요 없습니다.

### 배지 설명

- **🔴 빨간색 배지 "쿠팡 링크"**
  - 쿠팡 도메인 링크 (coupang.com, link.coupang.com, coupa.ng)
  - 쿠팡 파트너스 링크를 의미

- **🟡 노란색 배지 "고지 문구"**
  - 대가성/제휴 고지 문구가 있는 블록 내의 외부 링크
  - "쿠팡 파트너스", "제휴 활동", "수수료", "협찬" 등의 문구 근처

### 예시

블로그나 리뷰 사이트를 방문하면:

```
이 포스팅은 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다.

추천 상품: [노트북 링크]🔴 쿠팡 링크  [마우스 링크]🟡 고지 문구
```

## 🔍 감지 규칙

### 1. 쿠팡 링크 감지 (RED Badge)

모든 링크의 `href` 속성을 검사하여 다음 문자열이 포함되면 빨간색 배지 표시:
- `coupang.com`
- `link.coupang.com`
- `coupa.ng`

### 2. 고지 문구 링크 감지 (YELLOW Badge)

**단계 1: 고지 문구 블록 찾기**

다음 키워드가 포함된 텍스트 블록 검색:
- 쿠팡 파트너스
- 파트너스 활동
- 일정액의 수수료
- 수수료를 제공받
- 제휴 활동
- 대가성
- 협찬
- 원고료
- 대가를 제공받

**단계 2: 필터링**

고지 문구 블록에서 다음 조건을 만족해야 함:
- 텍스트 길이: 20~600자
- 위치: footer, nav, header, aside 외부
- Role 속성: contentinfo, navigation 아님

**단계 3: 외부 링크 배지 부여**

고지 문구 블록 내부의 링크 중:
- 현재 페이지와 다른 도메인
- 이미 RED 배지가 없는 링크
- HTTP/HTTPS 프로토콜 사용

## 🛠️ 기술 세부사항

### 아키텍처

```
content.js
├── URLHelper          # URL 파싱 및 비교 유틸리티
├── LinkDetector       # 링크 감지 로직
├── BadgeRenderer      # 배지 렌더링
├── ObserverManager    # MutationObserver 관리
└── AffiliateDetectorApp  # 메인 애플리케이션
```

### 성능 최적화

- **WeakSet 중복 방지**: 이미 처리한 링크는 다시 처리하지 않음
- **증분 스캔**: MutationObserver로 새로 추가된 요소만 처리
- **캐싱**: 고지 문구 블록을 WeakSet으로 캐싱
- **DOM 전용**: 네트워크 요청 없이 즉시 작동

### 스타일 충돌 방지

배지는 다음 스타일로 사이트 CSS와 충돌 방지:
- `all: unset` - 모든 스타일 초기화
- `!important` - 우선순위 강제
- `pointer-events: none` - 클릭 이벤트 차단
- `white-space: nowrap` - 줄바꿈 방지
- `z-index: 2147483647` - 최상위 레이어

## 🧪 테스트 시나리오

### 1. Footer 테스트
- ✅ footer에 고지 문구가 있어도 본문 링크에 노란색 배지가 붙지 않아야 함

### 2. 내부 링크 테스트
- ✅ 같은 사이트의 다른 페이지 링크 (이전글, 다음글, 카테고리)에 노란색 배지가 붙지 않아야 함
- ✅ www, m, amp 등의 prefix는 무시하고 같은 도메인으로 인식

### 3. 동적 로딩 테스트
- ✅ 무한 스크롤이나 "더보기" 버튼으로 추가된 링크도 자동 감지

### 4. CSS 충돌 테스트
- ✅ 배지로 인해 레이아웃이 깨지거나 줄바꿈이 발생하지 않아야 함

## 🔐 프라이버시 & 보안

- ❌ **네트워크 요청 없음**: fetch, XHR, WebRequest 사용 안 함
- ❌ **데이터 수집 없음**: 어떤 정보도 저장하거나 전송하지 않음
- ✅ **DOM만 사용**: 페이지의 HTML 구조만 분석
- ✅ **오픈 소스**: 모든 코드가 공개되어 있음

## 📋 파일 구조

```
findcoupang/
├── manifest.json          # Chrome Extension 설정
├── content.js            # 메인 로직 (DOM 스캔 및 배지 렌더링)
├── icons/
│   ├── icon.svg         # SVG 아이콘
│   ├── icon16.png       # 16x16 아이콘 (생성 필요)
│   ├── icon48.png       # 48x48 아이콘 (생성 필요)
│   └── icon128.png      # 128x128 아이콘 (생성 필요)
└── README.md            # 이 파일
```

## 🐛 디버깅

### 콘솔 로그 확인

개발자 도구(F12) > Console에서 다음 로그를 확인할 수 있습니다:

```
[Coupang Detector] Initializing...
[Coupang Detector] Starting initial scan...
[Coupang Detector] Initial scan complete
[Coupang Detector] MutationObserver started
[Coupang Detector] Ready
```

### 수동 제어 (디버깅용)

콘솔에서 다음 명령어를 실행할 수 있습니다:

```javascript
// 앱 인스턴스 확인
window.__coupangDetector

// 모든 배지 제거
window.__coupangDetector.renderer.removeAllBadges()

// Observer 중지
window.__coupangDetector.observerManager.stopObserving()

// Observer 재시작
window.__coupangDetector.observerManager.startObserving()

// 전체 재스캔
window.__coupangDetector.observerManager.initialScan()
```

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해 주세요.

## ⚠️ 면책 조항

이 확장 프로그램은 정보 제공 목적으로만 사용됩니다. 링크 감지의 정확성을 보장하지 않으며, 사용자의 판단이 필요합니다.

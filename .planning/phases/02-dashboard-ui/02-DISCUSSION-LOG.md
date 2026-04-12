# Phase 2: Dashboard UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 02-dashboard-ui
**Areas discussed:** 컴포넌트 분해 전략, 디자인 시스템 정체성, 테이블 인터랙션, Macro Warning 동적 연동

---

## 컴포넌트 분해 전략

### 컴포넌트 디렉토리 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 탭별 컴포넌트 분리 | layout/, overview/, tables/, ui/ 서브디렉토리 구조 | ✓ |
| 영역별 분리 (Flat) | components/ 하위에 플랫하게 배치 | |
| Claude 재량 | 규모 분석 후 최적 구조 결정 | |

**User's choice:** 탭별 컴포넌트 분리
**Notes:** Preview에서 구체적 파일 구조 확인 후 선택

### 테이블 재사용

| Option | Description | Selected |
|--------|-------------|----------|
| 통합 StockTable | 하나의 StockTable에 props로 데이터 전달 | ✓ |
| 각각 별도 테이블 | Watchlist/Monitoring 고유 테이블 | |

**User's choice:** 통합 StockTable

### Static 데이터 처리

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder 유지 | 현재 static 데이터 그대로 두고 컴포넌트만 분리 | ✓ |
| Placeholder 명시적 표시 | 'AI 요약 연동 예정' 라벨 부착 | |
| 숨기기 | Phase 3 전까지 비활성화 | |

**User's choice:** Placeholder 유지

---

## 디자인 시스템 정체성

### 디자인 스타일

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 스타일 유지 | rounded-xl, shadow-sm, border 카드 스타일 | ✓ |
| 브루탈리즘 강화 | rounded-none, no shadow, border-2 | |
| 하이브리드 | 카드는 둥글게, 테이블/배지는 날카롭게 | |

**User's choice:** 현재 스타일 유지
**Notes:** 이미 목업 스타일과 일치

### 컬러 팔레트

| Option | Description | Selected |
|--------|-------------|----------|
| PRD 컬러 엄격 적용 | #F8FAFC, #1E293B, #EA580C, #2563EB 커스텀 등록 | ✓ |
| Tailwind 기본 컬러 유지 | slate-50, blue-600 등 기본값 사용 | |

**User's choice:** PRD 컬러 엄격 적용

### 모바일 테이블 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 가로 스크롤 유지 | overflow-x-auto 그대로 | |
| 모바일은 카드 뷰 | 각 종목을 카드 형태로 렌더링 | ✓ |
| Claude 재량 | 모바일 UX 최적화 방식 자동 판단 | |

**User's choice:** 모바일은 카드 뷰

---

## 테이블 인터랙션

### 정렬 UI

| Option | Description | Selected |
|--------|-------------|----------|
| 컬럼 헤더 클릭 | 헤더 클릭 시 정렬, 화살표 아이콘 표시 | ✓ |
| 정렬 드롭다운 | 테이블 상단 드롭다운 메뉴 | |

**User's choice:** 컬럼 헤더 클릭
**Notes:** Zustand sortConfig와 연동

### 검색 바 위치

| Option | Description | Selected |
|--------|-------------|----------|
| 테이블 상단 검색바 | 각 테이블 헤더 영역에 배치 | ✓ |
| 글로벌 검색바 | 헤더 영역에 통합 검색 | |

**User's choice:** 테이블 상단 검색바
**Notes:** Zustand searchQuery와 연동

### Strategic Note 컬럼

| Option | Description | Selected |
|--------|-------------|----------|
| 빈 컬럼 추가 | 컬럼 추가, 데이터는 '-' 표시 | ✓ |
| 하드코딩 노트 | 종목별 미리 정의된 전략 노트 | |
| 컬럼 제외 | Phase 2에서 제외 | |

**User's choice:** 빈 컬럼 추가

---

## Macro Warning 동적 연동

### 임계치 돌파 표시 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 카드 내 색상 변화 | Market Card 테두리/배경 Amber/Red 변경 | ✓ |
| 별도 Alert 배너 | 페이지 상단 경고 배너 | |
| 모두 적용 | 카드 색상 + 상단 배너 | |

**User's choice:** 카드 내 색상 변화

### Warning 텍스트 형태

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 static 텍스트 유지 | 하드코딩된 설명 유지, 색상만 동적 | |
| 동적 값 포함 | "현재 10Y Yield: 4.62% (임계치 4.5% 돌파)" 형태 | ✓ |

**User's choice:** 동적 값 포함

---

## Claude's Discretion

- StockTable 모바일 카드 뷰 세부 레이아웃
- Overview 탭 반응형 breakpoint 세부 조정
- Skeleton UI 확장 방식

## Deferred Ideas

None

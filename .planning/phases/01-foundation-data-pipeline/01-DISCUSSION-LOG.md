# Phase 1: Foundation & Data Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 01-foundation-data-pipeline
**Areas discussed:** API 구조 & 라우트 설계, Fear & Greed / Revision 데이터 대안, 퀀트 엔진 계산 기준, 에러 처리 & 데이터 Freshness

---

## API 구조 & 라우트 설계

### Q1: Watchlist/Monitoring 엔드포인트 분리

| Option | Description | Selected |
|--------|-------------|----------|
| 통합 `/api/watchlist` | 21개 종목 전부 한 번에 반환, list 필드로 구분 | |
| 분리 `/api/watchlist` + `/api/monitoring` | 각 12개, 9개 반환. 탭별 독립 갱신 | ✓ |
| Claude 재량 | 구현 시 판단에 맡김 | |

**User's choice:** 분리 방식
**Notes:** 탭별 독립 갱신, 장애 격리 가능

### Q2: API 호출 실패 시 부분 데이터 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 부분 반환 | 성공 종목은 정상, 실패 종목은 null/에러 필드 | ✓ |
| 전체 실패 | 하나라도 실패하면 전체 에러 | |
| Claude 재량 | | |

**User's choice:** 부분 반환
**Notes:** None

### Q3: S&P 500 기준 데이터 공유 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 서버에서 내부 공유 | API가 RS 계산 완료 후 반환 | ✓ |
| 클라이언트에서 조합 | 클라이언트가 RS 계산 | |
| Claude 재량 | | |

**User's choice:** 서버에서 내부 공유 (효율적인 방식으로 요청)
**Notes:** 퀀트 계산을 서버에 집중

### Q4: Yahoo Finance API 호출 최적화

| Option | Description | Selected |
|--------|-------------|----------|
| 일괄 호출 | 전체 심볼 한 번에 조회 | |
| 그룹 호출 | watchlist/monitoring/market-data 3그룹 병렬 | ✓ |
| Claude 재량 | | |

**User's choice:** 그룹 호출
**Notes:** API 엔드포인트 분리와 일치

---

## Fear & Greed / Revision 데이터 대안

### Q5: Fear & Greed Index 데이터 소싱

| Option | Description | Selected |
|--------|-------------|----------|
| CNN 스크래핑 | CNN 페이지에서 파싱, 구조 변경 시 깨질 수 있음 | |
| 대체 무료 API | `fear-and-greed` npm 등 서드파티 활용 | ✓ |
| Phase 1 하드코딩/목업 | 자리만 만들고 연동은 나중에 | |
| Claude 재량 | 리서치에서 최적 소스 조사 | |

**User's choice:** 대체 무료 API
**Notes:** 리서치 단계에서 패키지 신뢰도 검증

### Q6: EPS Revision 데이터 소싱

| Option | Description | Selected |
|--------|-------------|----------|
| yahoo-finance2 우선 시도 | earningsTrend 모듈에서 추출 시도, 실패 시 대안 | ✓ |
| 별도 무료 소스 병행 | Financial Modeling Prep 등 | |
| 수동 입력 | 사용자가 직접 UP/DOWN/NEUTRAL 지정 | |
| Claude 재량 | 리서치에서 검증 후 결정 | |

**User's choice:** yahoo-finance2 우선 시도
**Notes:** earningsTrend 실제 응답 구조 검증 필요

### Q7: Fear & Greed 표시 형태

| Option | Description | Selected |
|--------|-------------|----------|
| 숫자 + 텍스트 라벨 | `42 (Fear)` 형태, 목업과 동일 | ✓ |
| 숫자만 | 해석은 사용자가 직접 | |
| Claude 재량 | | |

**User's choice:** 숫자 + 텍스트 라벨
**Notes:** 목업과 일치

---

## 퀀트 엔진 계산 기준

### Q8: Wait 조건 — AND vs OR

| Option | Description | Selected |
|--------|-------------|----------|
| AND (PROJECT.md 스펙) | Revision DOWN + RS < 90 둘 다 충족 | |
| OR (목업 코드) | Revision DOWN 또는 RS < 90 하나만 충족 | ✓ |
| Claude 재량 | | |

**User's choice:** OR (목업 코드 기준)
**Notes:** 위험 신호에 더 민감하게 반응. PROJECT.md 수정 필요.

### Q9: RS 계산 변동% 기간

| Option | Description | Selected |
|--------|-------------|----------|
| 1일 (1D) | 당일 변동률 기준, 목업의 change 필드와 일치 | ✓ |
| 1개월 (1M) | 20거래일 기준, 전통적 RS | |
| 3개월 (3M) | 60거래일 기준, 안정적이지만 느림 | |
| Claude 재량 | | |

**User's choice:** 1일 (1D)
**Notes:** 매일 센싱하는 대시보드 성격에 부합

### Q10: MA50 데이터 소싱

| Option | Description | Selected |
|--------|-------------|----------|
| historical() 직접 계산 | 50거래일 종가 평균 계산 | |
| quote() fiftyDayAverage 필드 | 추가 호출 없이 활용 | |
| Claude 재량 | fiftyDayAverage 있으면 활용, 없으면 직접 계산 | ✓ |

**User's choice:** Claude 재량
**Notes:** 리서치에서 fiftyDayAverage 필드 존재 확인 후 결정

---

## 에러 처리 & 데이터 Freshness

### Q11: API 장애 시 stale 데이터 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 마지막 성공 데이터 유지 + 경고 | 이전 데이터 유지, freshness 경고 표시 | |
| 에러 상태 전환 | 실패 영역은 에러 메시지로 대체 | ✓ |
| Claude 재량 | | |

**User's choice:** 에러 상태 전환
**Notes:** 오래된 데이터보다 명확한 에러 표시가 금융 대시보드에 더 안전

### Q12: 장 마감 후 / 주말 데이터 갱신

| Option | Description | Selected |
|--------|-------------|----------|
| 항상 5분 갱신 | 심플, BTC/Gold 등 24시간 자산 반영 | |
| 장 운영시간 5분, 마감 후 30분 | 주식은 변하지 않으므로 호출 절약 | ✓ |
| Claude 재량 | | |

**User's choice:** 장 운영시간 5분, 마감 후 30분
**Notes:** API 호출 최적화, 24시간 자산은 마감 후에도 갱신

---

## Claude's Discretion

- MA50 데이터 소싱 방식 (fiftyDayAverage 필드 유무에 따라)
- 부동소수점 임계값 비교 시 epsilon 범위

## Deferred Ideas

None — discussion stayed within phase scope

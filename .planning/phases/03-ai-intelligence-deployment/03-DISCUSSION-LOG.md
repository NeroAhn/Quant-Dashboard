# Phase 3: AI Intelligence & Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 03-ai-intelligence-deployment
**Areas discussed:** Summary 프롬프트 전략, 캐싱 & Fallback 정책, 배포 & 환경 설정, Summary 톤 & 언어

---

## Summary 프롬프트 전략

### 입력 데이터

| Option | Description | Selected |
|--------|-------------|----------|
| 전체 데이터 통합 (추천) | Market data + Watchlist/Monitoring 종목별 핵심 지표 + Macro Threshold 돌파 여부. 모든 탭 데이터 종합. | ✓ |
| Market data + 액션 신호 요약만 | 시장 지표 + 종목별 액션 신호 분포만 전달. 토큰 절약. | |
| Market data만 | 시장 지표만 전달. 종목별 데이터 제외. | |

**User's choice:** 전체 데이터 통합
**Notes:** 가장 풍부한 요약을 위해 모든 데이터 소스 통합

### 3줄 구조

| Option | Description | Selected |
|--------|-------------|----------|
| Macro/Quant/Implication 고정 (추천) | 현재 placeholder와 동일. 1줄 매크로, 2줄 퀀트, 3줄 시장 함의/액션 권고. | ✓ |
| AI 자유 구성 | Gemini가 자유롭게 3줄 구성. 유연하지만 형식 불일치 가능. | |
| 번호 + 태그 고정 | 1. [Macro] / 2. [Quant] / 3. [Action] 번호와 태그 고정, 내용만 AI 생성. | |

**User's choice:** Macro/Quant/Implication 고정
**Notes:** 일관된 형식으로 전략가가 빠르게 스캔 가능

---

## 캐싱 & Fallback 정책

### 캐싱 위치

| Option | Description | Selected |
|--------|-------------|----------|
| 서버사이드 캐싱 (추천) | API Route에서 in-memory 캐시 30분. Gemini API 호출 최소화. | ✓ |
| 클라이언트 캐싱 | TanStack Query staleTime 30분. 여러 탭 열면 중복 호출 가능. | |
| 양쪽 모두 | 서버 + 클라이언트 이중 캐싱. 복잡도 증가. | |

**User's choice:** 서버사이드 캐싱
**Notes:** 무료 티어 한도 보호 우선

### Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| 마지막 성공 요약 유지 (추천) | 캐시된 마지막 성공 응답 계속 표시 + "캐시된 데이터" 표시. | ✓ |
| Static placeholder 복귀 | 하드코딩된 3줄 placeholder로 복귀. | |
| 에러 메시지 표시 | "AI 요약을 불러올 수 없습니다" 에러 UI. | |

**User's choice:** 마지막 성공 요약 유지
**Notes:** 사용자에게 빈 공간보다 지난 요약이라도 제공

---

## 배포 & 환경 설정

### 도메인

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel 기본 도메인 (추천) | *.vercel.app 기본 도메인. 개인 전용이므로 충분. | ✓ |
| 커스텀 도메인 연결 | 본인 소유 도메인 연결. DNS 설정 필요. | |

**User's choice:** Vercel 기본 도메인
**Notes:** 개인 전용 대시보드이므로 불필요

### 배포 설정

| Option | Description | Selected |
|--------|-------------|----------|
| 기본 설정만 (추천) | GEMINI_API_KEY 환경변수만 설정. 기본 Next.js 빌드. | ✓ |
| 빌드 최적화 필요 | Edge Runtime, ISR, 이미지 최적화 등 추가 기능 활용. | |

**User's choice:** 기본 설정만
**Notes:** 추가 최적화 불필요

---

## Summary 톤 & 언어

### 언어

| Option | Description | Selected |
|--------|-------------|----------|
| 한국어 (추천) | UI 전체 한국어(DSGN-05) 일치. 금융 용어는 영어 혼용. | ✓ |
| 영어 | 금융 용어 정확성. UI 언어 불일치. | |
| 한영 혼합 | 한국어 기본 + 금융 용어 영어. | |

**User's choice:** 한국어
**Notes:** 현재 placeholder 스타일과 동일하게 한국어 기본, 금융 용어 영어 허용

### 어조

| Option | Description | Selected |
|--------|-------------|----------|
| 전략가 브리핑 (추천) | 간결하고 단정적. Actionable 인사이트 포함. | ✓ |
| 중립적 분석 | 객관적 데이터 요약. 판단/권고 없음. | |
| 공격적 액션 | 매수/매도 타이밍, 비중 조절 등 구체적 액션 강조. | |

**User's choice:** 전략가 브리핑
**Notes:** 현재 placeholder와 동일한 전문가 톤

## Claude's Discretion

- Gemini 프롬프트의 세부 워딩 및 토큰 길이 제한
- 서버사이드 캐시 구현 방식
- TanStack Query refetchInterval 세부값
- Vercel 빌드/배포 설정 세부사항

## Deferred Ideas

None

# TradingAPP

`TradingAPP`은 `develop-plans` 문서를 기준으로 `Electron + React + TypeScript + Python` 개발환경을 구성한 저장소입니다.

## 현재 구현 범위

- `app/` 중심 Electron 앱 실행 구조
- 루트 `.venv` 기반 Python 개발환경
- 시작 화면(Home) 구현
- 정적 예시 화면(`frontend-examples`) 유지

## 프로젝트 구조

- `app/`: Electron 앱 실행을 위한 모든 파일
- `app/data/`: 앱 실행 시 필요한 데이터 위치
- `app/service/`: 백엔드 기능 모듈(service) 위치
- `develop-plans/`: PRD/아키텍처/와이어프레임/전략 문서
- `frontend-examples/`: 정적 UI 예시
- `etc/`: 레거시/기타 보관

## 요구 버전

- Node.js `20+`
- npm `10+`
- Python `3.13+` (Windows `py` launcher 기준)
- 버전 핀 파일: `.nvmrc`, `.python-version`

## 개발환경 세팅 (Windows PowerShell)

```powershell
.\app\scripts\setup.ps1 -Recreate
```

옵션:

```powershell
.\app\scripts\setup.ps1 -SkipPython
.\app\scripts\setup.ps1 -SkipNode
```

## Electron 개발 실행

```powershell
.\app\scripts\dev.ps1
```

또는:

```powershell
cd .\app
npm run dev
```

## 타입체크

```powershell
.\app\scripts\dev.ps1 -TypecheckOnly
```

또는:

```powershell
cd .\app
npm run typecheck
```

## 프로덕션 빌드 확인

```powershell
cd .\app
npm run build
```

## 정적 예시 화면(참고용)

```powershell
.\frontend-examples\scripts\serve.ps1 -Port 5500 -Path frontend-examples
```

브라우저 주소:

- `http://localhost:5500/home.html`

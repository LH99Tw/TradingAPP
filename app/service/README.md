# Service Modules

이 폴더는 백엔드 성격 기능 모듈을 두는 기준 폴더입니다.

- 데이터 적재/동기화
- 전략 DSL 검증
- 백테스트 실행
- 리스크 점검
- 실행/모니터링 서비스

새 기능은 `service/<domain>/...` 구조로 추가하세요.

현재 연결된 모듈:

- `runtime-data.ts`: `app/data` 런타임 디렉터리 보장

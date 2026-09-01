WISE WEBSITE V5 — ADMIN UPLOAD VERSION

이 버전은 홈페이지에서 직접 작품을 등록할 수 있습니다.

관리자 주소
https://bywise.kr/admin.html

관리 화면에서
- 프로젝트명 입력
- 작업 유형 입력
- 영상 URL 입력
- 썸네일 파일 선택
- HOME 노출 여부 선택
- UPLOAD PROJECT 클릭
하면 HOME / WORK에 자동 반영됩니다.

처음 한 번만 Supabase 무료 프로젝트 설정이 필요합니다.

SETUP
1. Supabase에서 새 프로젝트 생성
2. SQL Editor에서 supabase-setup.sql 전체 실행
3. Authentication → Users에서 관리자 계정 생성
4. Project Settings/API에서 Project URL과 anon public key 확인
5. config.js의 두 값을 교체
6. 전체 파일을 GitHub에 업로드

보안
- 공개 방문자는 projects 읽기만 가능
- 로그인한 관리자만 등록/삭제 가능
- admin.html은 메뉴에는 노출되지 않음
- anon key는 공개되어도 되는 키이며 RLS 정책으로 쓰기 권한을 제한함

Supabase 설정 전에는 기존 projects.txt를 읽어 사이트가 작동합니다.

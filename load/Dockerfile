# Node.js가 설치된 경량 이미지 사용
FROM node:18-slim

# 작업 디렉토리 생성
WORKDIR /app

# 봇 파일 복사
COPY bot.js .

# 의존성 설치 (최신 npm에서 종종 발생하는 peer conflict 방지)
RUN npm init -y \
  && npm install mineflayer --legacy-peer-deps \
  && npm cache clean --force

# 봇 실행
CMD ["node", "bot.js"]

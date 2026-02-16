FROM node:20-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY src/ ./src/

RUN mkdir -p data uploads

EXPOSE 3000

CMD ["node", "src/app.js"]

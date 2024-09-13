# 指定基礎映像
FROM node:20-alpine as builder

# 設定工作目錄
WORKDIR /app

# 清理npm缓存
RUN npm cache clean --force

# 單獨複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製專案文件
COPY . .

# 構建應用
RUN npm run build

# 使用 nginx 作為伺服器
FROM nginx:alpine
# 安裝 bash
RUN apk add --no-cache bash
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

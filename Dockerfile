# ============================================
# المرحلة 1: بناء التطبيق (Build Stage)
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# نسخ ملفات الـ dependencies أولاً للاستفادة من الكاش
COPY package.json package-lock.json* ./
RUN npm ci --production=false

# نسخ باقي ملفات المشروع
COPY . .

# بناء التطبيق للبرودكشن
RUN npm run build

# ============================================
# المرحلة 2: تشغيل التطبيق (Production Stage)
# ============================================
FROM nginx:alpine

# نسخ إعدادات Nginx المخصصة
COPY nginx.conf /etc/nginx/conf.d/default.conf

# نسخ ملفات البناء من المرحلة الأولى
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

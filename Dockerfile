FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_ORIGIN
ARG VITE_API_BASE_URL
ARG VITE_API_VERSION
ARG VITE_API_KEY
ARG VITE_GOOGLE_CLIENT_ID

COPY package.json package-lock.json* ./
RUN npm ci --production=false

COPY . .

RUN npm run build
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

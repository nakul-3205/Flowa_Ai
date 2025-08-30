
FROM node:18-alpine AS base


WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile


COPY . .


RUN npm run build


FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy from builder
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000


CMD ["npm", "start"]

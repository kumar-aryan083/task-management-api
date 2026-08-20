# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
# Prisma's schema engine (used by `prisma generate`/`migrate`) probes the
# system OpenSSL version; bookworm-slim strips it out, which otherwise
# produces a "failed to detect libssl" warning and an unverified guess.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# ---- deps: install everything (including devDependencies), cached separately from source ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: generate the Prisma client and compile TypeScript ----
FROM deps AS builder
COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
# prisma.config.ts reads DATABASE_URL at load time; a real connection is never
# made during `generate`, but a well-formed value avoids config validation
# errors in an environment with no .env file.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate
RUN npm run build

# ---- prod-deps: production-only node_modules for the final image ----
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- runner: minimal runtime image ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# The generated Prisma client's actual code lives in node_modules/.prisma —
# node_modules/@prisma/client just re-exports from it. A --omit=dev install
# never generates this, so it must be copied from the builder stage.
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node package.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]

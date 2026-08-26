# Multi-stage build: compile the client (Vite/React) separately, then ship
# only the production server + built static assets in the final image.
# Explicit Dockerfile (instead of Railway's Railpack/Nixpacks auto-builders)
# so build steps are fully under our control.

# ---- Stage 1: build the client ----
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: production server ----
FROM node:20-slim
WORKDIR /app/server
ENV NODE_ENV=production

COPY server/package.json server/package-lock.json ./

# bcrypt falls back to compiling a native binary (node-gyp) when no prebuilt
# binary matches the target platform/Node ABI; the toolchain is installed,
# used by `npm ci`, and purged within this single layer so it never ends up
# in the final image (splitting this across separate RUN layers would not —
# Docker layers are additive, a later layer can't shrink an earlier one).
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && npm ci --omit=dev \
    && apt-get purge -y --auto-remove python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY server/ ./
COPY --from=client-build /app/client/dist /app/client/dist

EXPOSE 4000
# Applies the schema (CREATE ... IF NOT EXISTS) and seeds the admin account
# (skipped if it already exists) before every boot — both are idempotent,
# so this removes the need to run them manually via `railway run`.
CMD ["npm", "run", "deploy"]

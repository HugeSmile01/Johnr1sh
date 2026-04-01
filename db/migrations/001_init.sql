-- 001_init.sql
-- Initial schema migration for Johnr1sh Copilot

CREATE TYPE "Role" AS ENUM ('user', 'admin');

CREATE TABLE "users" (
    "id"          TEXT         NOT NULL,
    "email"       TEXT         NOT NULL,
    "name"        TEXT,
    "avatarUrl"   TEXT,
    "role"        "Role"       NOT NULL DEFAULT 'user',
    "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE TABLE "refresh_tokens" (
    "id"         TEXT        NOT NULL,
    "token"      TEXT        NOT NULL,
    "userId"     TEXT        NOT NULL,
    "expiresAt"  TIMESTAMPTZ NOT NULL,
    "revokedAt"  TIMESTAMPTZ,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

CREATE TABLE "conversations" (
    "id"        TEXT        NOT NULL,
    "userId"    TEXT        NOT NULL,
    "title"     TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "conversations_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");

CREATE TABLE "chat_messages" (
    "id"             TEXT        NOT NULL,
    "conversationId" TEXT        NOT NULL,
    "role"           TEXT        NOT NULL,
    "content"        TEXT        NOT NULL,
    "tokenCount"     INTEGER,
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_messages_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE
);
CREATE INDEX "chat_messages_conversationId_idx" ON "chat_messages"("conversationId");

CREATE TABLE "audit_logs" (
    "id"        TEXT        NOT NULL,
    "userId"    TEXT,
    "action"    TEXT        NOT NULL,
    "resource"  TEXT        NOT NULL,
    "metadata"  JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx"  ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- Row Level Security
ALTER TABLE "users"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refresh_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_messages"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs"     ENABLE ROW LEVEL SECURITY;

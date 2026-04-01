# API Reference

All procedures are accessed via **tRPC** over HTTP.

Base URL: `https://your-domain.vercel.app/api/trpc`  
Local: `http://localhost:4000/trpc`

All requests require `Content-Type: application/json`.  
Protected procedures require `Authorization: Bearer <accessToken>`.

---

## Auth Router (`auth.*`)

### `auth.exchangeToken` — mutation

Exchange a Supabase OAuth access token for our JWT pair.

**Input**
```ts
{ supabaseAccessToken: string }
```

**Output**
```ts
{ accessToken: string; refreshToken: string; expiresIn: 900 }
```

---

### `auth.refreshTokens` — mutation

Rotate refresh token and issue new access + refresh token pair.

**Input**
```ts
{ refreshToken: string }
```

**Output**
```ts
{ accessToken: string; refreshToken: string; expiresIn: 900 }
```

---

### `auth.logout` — mutation (🔒 protected)

Revoke refresh token and end session.

**Output**
```ts
{ success: true }
```

---

### `auth.me` — query (🔒 protected)

Return current user profile.

**Output**
```ts
{ id: string; email: string; name?: string; avatarUrl?: string; role: "user"|"admin"; createdAt: Date; updatedAt: Date }
```

---

## Chat Router (`chat.*`)

### `chat.sendMessage` — mutation (🔒 protected)

Send a message and receive an AI response.

**Input**
```ts
{ message: string; conversationId?: string }
```

**Output**
```ts
{ conversationId: string; message: ChatMessage }
```

---

### `chat.getConversations` — query (🔒 protected)

List conversations (paginated).

**Input**
```ts
{ cursor?: string; limit?: number } // default limit: 20
```

**Output**
```ts
{ items: Conversation[]; hasMore: boolean; nextCursor?: string }
```

---

### `chat.getMessages` — query (🔒 protected)

Get messages for a conversation (paginated).

**Input**
```ts
{ conversationId: string; cursor?: string; limit?: number }
```

**Output**
```ts
{ items: ChatMessage[]; hasMore: boolean; nextCursor?: string }
```

---

## Error Codes

| Code                    | HTTP Status | Description                         |
| ----------------------- | ----------- | ----------------------------------- |
| `UNAUTHORIZED`          | 401         | Missing or invalid JWT              |
| `FORBIDDEN`             | 403         | Insufficient permissions            |
| `NOT_FOUND`             | 404         | Resource not found                  |
| `TOO_MANY_REQUESTS`     | 429         | Rate limit exceeded                 |
| `BAD_REQUEST`           | 400         | Invalid input                       |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected server error             |

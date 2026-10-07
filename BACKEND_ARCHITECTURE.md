# MindSweepers - Backend Architecture & API Specification

**Theme**: Inception
**Stack**: Node.js, Express (or similar), MongoDB

This document outlines the robust, decoupled backend architecture for MindSweepers. The core philosophy is that the three mini-games (Dreamwall, Architect, Polarity) are developed and maintained completely independently. The only common bridge between them is the unified authentication and scoring system.

## 1. Database Schema (MongoDB)

We will use MongoDB to store users and their scores. By separating `Users` and `Scores`, we ensure the system can handle unlimited plays and scale efficiently.

### `User` Collection
Stores player authentication and profile data.
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": { "type": "String", "unique": true },
  "phoneNumber": { "type": "String", "unique": true },
  "username": { "type": "String", "unique": true }, // See Username Validation below
  "createdAt": "Date"
}
```

### `Score` Collection
Records every successful game completion. Since games can be played an unlimited number of times, we store each win as a separate document.
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId", // Reference to User
  "gameId": { "type": "String", "enum": ["dreamwall", "architect", "polarity"] },
  "difficulty": { "type": "String", "enum": ["easy", "medium", "hard"] },
  "points": "Number", // 20, 30, or 50
  "playedAt": "Date"
}
```

## 2. Common Scoring & Leaderboard Logic

To prevent game-specific logic from breaking the backend, the client games **do not** send points to the server. They only report that a user won a specific difficulty. The backend enforces the scoring rules:

- **Easy** = 20 Points
- **Medium** = 30 Points
- **Hard** = 50 Points

### Leaderboard Aggregation
Because users can play an unlimited number of times, the Top 10 Leaderboard can be calculated dynamically using a MongoDB Aggregation Pipeline that sums the `points` from the `Score` collection grouped by `userId`, sorts descending, and limits to 10.

## 3. API Endpoints Contract

### Auth & Users
- `POST /api/auth/register`
  - **Body**: `{ email, phoneNumber, name, username }`
  - **Logic**: Validates inputs, creates user. 
  - **Username Validation (TODO)**: Add a middleware step here in the future to block abusive words and college club names. For now, just check uniqueness.
- `POST /api/auth/login`
  - **Body**: `{ email }` or `{ phoneNumber }` (Depending on preferred login flow)
  - **Returns**: Auth token (JWT) or Session Cookie.

### Scores & Games
- `POST /api/scores/submit`
  - **Auth**: Requires JWT/Session
  - **Body**: `{ gameId: "architect", difficulty: "hard" }`
  - **Logic**: 
    1. Verify user is logged in.
    2. Map the `difficulty` to the correct points (Easy: 20, Med: 30, Hard: 50).
    3. Insert new document into `Score` collection.
  - *Why this is robust*: The game devs only need to call this single endpoint when a player wins. Even if a game's internal code breaks, it won't affect the unified database.

- `GET /api/leaderboard`
  - **Returns**: Array of top 10 users and their total scores.
  - **Response**: `[ { "username": "cobb", "totalScore": 450 }, ... ]`

## 4. Development Workflow for Game Teams

If you are a developer working on one of the specific games (Dreamwall, Architect, or Polarity), you **do not need to touch the backend code**. 

1. Build your game logic entirely on the frontend.
2. When the user successfully finishes a level, simply make a POST request to `/api/scores/submit` with your `gameId` and the `difficulty` they beat.
3. The backend will handle the security, point assignment, and leaderboard updates.

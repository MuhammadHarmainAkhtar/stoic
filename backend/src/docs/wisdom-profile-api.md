# Wisdom Hall & Profile API Documentation

This document outlines the API endpoints for the Wisdom Hall and Profile features in the Stoic application.

## Wisdom Hall

The Wisdom Hall serves as a showcase for top-performing content across the Stoic platform, including circles, posts, and rituals.

### Endpoints

#### Get Top Circles
- **URL**: `/api/wisdom/top-circles`
- **Method**: `GET`
- **Query Parameters**:
  - `limit` (optional): Number of results to return (default: 10)
- **Response**: Returns top-ranked circles based on member count and engagement metrics

#### Get Top Posts
- **URL**: `/api/wisdom/top-posts`
- **Method**: `GET`
- **Query Parameters**:
  - `limit` (optional): Number of results to return (default: 10)
- **Response**: Returns top forum posts by upvotes

#### Get Top Rituals
- **URL**: `/api/wisdom/top-rituals`
- **Method**: `GET`
- **Query Parameters**:
  - `limit` (optional): Number of results to return (default: 10)
- **Response**: Returns top rituals by adoption count and upvotes

#### Get Wisdom Feed
- **URL**: `/api/wisdom/feed`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response**: Returns a combined feed of top posts and rituals, sorted by engagement metrics

#### Search
- **URL**: `/api/wisdom/search`
- **Method**: `GET`
- **Query Parameters**:
  - `query` (required): Search keyword or phrase
  - `type` (optional): Filter results by type (`users`, `circles`, `rituals`, `posts`)
  - `limit` (optional): Number of results to return per type (default: 10)
- **Response**: Returns search results across all content types or the specified type

#### Get User's Wisdom Interactions
- **URL**: `/api/wisdom/interactions`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "contentIds": ["id1", "id2", "id3"] // Array of content IDs
  }
  ```
- **Response**: Returns a map of user interactions (upvotes, saves) for the specified content IDs

#### Create Interaction
- **URL**: `/api/wisdom/content/interactions`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "contentType": "post" | "ritual",
    "contentId": "id",
    "type": "upvote" | "downvote" | "save"
  }
  ```
- **Response**: Returns the created interaction

#### Add Comment
- **URL**: `/api/wisdom/content/comments`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "contentType": "post" | "ritual",
    "contentId": "id",
    "comment": "Comment text"
  }
  ```
- **Response**: Returns the created comment

#### Get Comments
- **URL**: `/api/wisdom/content/comments/:contentType/:contentId`
- **Method**: `GET`
- **URL Parameters**:
  - `contentType`: Type of content (`post` or `ritual`)
  - `contentId`: ID of the content
- **Response**: Returns comments for the specified content

#### Report Content
- **URL**: `/api/wisdom/content/report`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "contentType": "post" | "ritual",
    "contentId": "id",
    "reason": "Reason for reporting"
  }
  ```
- **Response**: Returns confirmation of the report submission

#### Share Content
- **URL**: `/api/wisdom/content/share`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "contentType": "post" | "ritual",
    "contentId": "id",
    "shareTarget": {
      "type": "circle" | "user",
      "id": "targetId"
    }
  }
  ```
- **Response**: Returns the created share interaction

## Profile

The Profile module provides functionality for managing user profiles, saved content, archived content, and activity tracking.

### Endpoints

#### Get User Profile
- **URL**: `/api/profile`
- **Method**: `GET`
- **Response**: Returns the user's profile data

#### Get Saved Items
- **URL**: `/api/profile/saved`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `type` (optional): Type of saved items (`all`, `forumPosts`, `circlePosts`, `rituals`)
- **Response**: Returns the user's saved items with pagination

#### Get Archived Items
- **URL**: `/api/profile/archived`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `type` (optional): Type of archived items (`all`, `posts`, `rituals`)
- **Response**: Returns the user's archived items with pagination

#### Get User Activity
- **URL**: `/api/profile/activity`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `type` (optional): Type of activity (`all`, `posts`, `rituals`, `adoptions`)
- **Response**: Returns the user's activity with pagination

#### Archive/Unarchive Post
- **URL**: `/api/profile/posts/:postId/archive`
- **Method**: `PATCH`
- **URL Parameters**:
  - `postId`: ID of the post
- **Body**:
  ```json
  {
    "archive": true | false
  }
  ```
- **Response**: Returns confirmation of the archive/unarchive operation

#### Archive/Unarchive Ritual
- **URL**: `/api/profile/rituals/:ritualId/archive`
- **Method**: `PATCH`
- **URL Parameters**:
  - `ritualId`: ID of the ritual
- **Body**:
  ```json
  {
    "archive": true | false
  }
  ```
- **Response**: Returns confirmation of the archive/unarchive operation

#### Update Recently Visited Circle
- **URL**: `/api/profile/circles/:circleId/visit`
- **Method**: `POST`
- **URL Parameters**:
  - `circleId`: ID of the circle
- **Response**: Returns confirmation that the circle was added to recently visited
# Forum and Rituals API Documentation

This document provides details on the Forum and Rituals modules of the Stoic application.

## Overview

The Stoic platform features two interconnected modules that enhance the social and habit-tracking experience:

1. **The Forum** - A public platform for posting text, photos, and videos where all users can interact
2. **Rituals** - A habit tracking system that can be adopted by users with public or circle visibility

## Authentication

All API endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## The Forum API

The Forum provides a platform for posting text, photos, and videos with various interaction capabilities.

### Endpoints

#### Create a Post

```
POST /api/forum
```

**Request Body (multipart/form-data):**
- `content` (string): The text content of the post
- `tags` (string): Comma-separated list of tags
- `files` (file, optional): Up to 5 media files (images/videos)

**Response:**
```json
{
  "status": "success",
  "data": {
    "post": {
      "_id": "60d21b4967d0d8992e610c85",
      "content": "This is a test post",
      "creator": {
        "_id": "60d21b4967d0d8992e610c85",
        "username": "johndoe",
        "profilePicture": "uploads/profiles/profile.jpg"
      },
      "mediaUrls": ["uploads/forum/image1.jpg"],
      "mediaType": "image",
      "tags": ["philosophy", "stoicism"],
      "stats": {
        "upvotes": 0,
        "comments": 0,
        "shares": 0,
        "saves": 0,
        "reports": 0
      },
      "createdAt": "2023-06-22T12:00:00.000Z",
      "updatedAt": "2023-06-22T12:00:00.000Z"
    }
  }
}
```

#### Get Forum Posts

```
GET /api/forum
```

**Query Parameters:**
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 10): Number of posts per page
- `sortBy` (string, default: 'latest'): Sort order ('latest', 'popular', 'comments')
- `tags` (string, optional): Filter by comma-separated tags

**Response:**
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "_id": "60d21b4967d0d8992e610c85",
        "content": "This is a test post",
        "creator": {
          "_id": "60d21b4967d0d8992e610c85",
          "username": "johndoe",
          "profilePicture": "uploads/profiles/profile.jpg"
        },
        "mediaUrls": ["uploads/forum/image1.jpg"],
        "mediaType": "image",
        "tags": ["philosophy", "stoicism"],
        "stats": {
          "upvotes": 0,
          "comments": 0,
          "shares": 0,
          "saves": 0,
          "reports": 0
        },
        "createdAt": "2023-06-22T12:00:00.000Z",
        "updatedAt": "2023-06-22T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

#### Get Post by ID

```
GET /api/forum/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "post": {
      "_id": "60d21b4967d0d8992e610c85",
      "content": "This is a test post",
      "creator": {
        "_id": "60d21b4967d0d8992e610c85",
        "username": "johndoe",
        "profilePicture": "uploads/profiles/profile.jpg"
      },
      "mediaUrls": ["uploads/forum/image1.jpg"],
      "mediaType": "image",
      "tags": ["philosophy", "stoicism"],
      "stats": {
        "upvotes": 5,
        "comments": 2,
        "shares": 1,
        "saves": 3,
        "reports": 0
      },
      "createdAt": "2023-06-22T12:00:00.000Z",
      "updatedAt": "2023-06-22T12:00:00.000Z"
    },
    "comments": [
      {
        "_id": "60d21b4967d0d8992e610c86",
        "user": {
          "_id": "60d21b4967d0d8992e610c87",
          "username": "janedoe",
          "profilePicture": "uploads/profiles/jane.jpg"
        },
        "comment": "Great post!",
        "createdAt": "2023-06-22T12:30:00.000Z"
      }
    ],
    "isUpvoted": true,
    "isSaved": false,
    "relatedRituals": [
      {
        "_id": "60d21b4967d0d8992e610c88",
        "title": "Daily Meditation",
        "description": "10 minutes of mindfulness meditation every day",
        "creator": {
          "_id": "60d21b4967d0d8992e610c85",
          "username": "johndoe",
          "profilePicture": "uploads/profiles/profile.jpg"
        },
        "stats": {
          "upvotes": 10,
          "adoptions": 5
        }
      }
    ]
  }
}
```

#### Update Post

```
PUT /api/forum/:id
```

**Request Body:**
- `content` (string): Updated post content
- `tags` (string): Updated comma-separated tags

**Response:**
```json
{
  "status": "success",
  "data": {
    "post": {
      "_id": "60d21b4967d0d8992e610c85",
      "content": "This is an updated post",
      "tags": ["philosophy", "stoicism", "mindfulness"],
      "updatedAt": "2023-06-22T14:00:00.000Z"
    }
  }
}
```

#### Delete Post

```
DELETE /api/forum/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

#### Get User's Posts

```
GET /api/forum/user/:userId
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "_id": "60d21b4967d0d8992e610c85",
        "content": "This is a test post",
        "creator": {
          "_id": "60d21b4967d0d8992e610c85",
          "username": "johndoe",
          "profilePicture": "uploads/profiles/profile.jpg"
        },
        "mediaUrls": ["uploads/forum/image1.jpg"],
        "mediaType": "image",
        "tags": ["philosophy", "stoicism"],
        "stats": {
          "upvotes": 5,
          "comments": 2,
          "shares": 1,
          "saves": 3,
          "reports": 0
        },
        "createdAt": "2023-06-22T12:00:00.000Z",
        "updatedAt": "2023-06-22T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

### Interaction Endpoints

#### Create Interaction (Upvote, Downvote, Save)

```
POST /api/forum/interactions
```

**Request Body:**
- `contentType` (string): 'post' or 'ritual'
- `contentId` (string): ID of the post or ritual
- `type` (string): 'upvote', 'downvote', or 'save'

**Response:**
```json
{
  "status": "success",
  "data": {
    "interaction": {
      "_id": "60d21b4967d0d8992e610c89",
      "user": "60d21b4967d0d8992e610c87",
      "contentType": "post",
      "contentId": "60d21b4967d0d8992e610c85",
      "type": "upvote",
      "createdAt": "2023-06-22T15:00:00.000Z"
    },
    "action": "added"
  }
}
```

#### Add Comment

```
POST /api/forum/comments
```

**Request Body:**
- `contentType` (string): 'post' or 'ritual'
- `contentId` (string): ID of the post or ritual
- `comment` (string): Comment text

**Response:**
```json
{
  "status": "success",
  "data": {
    "comment": {
      "_id": "60d21b4967d0d8992e610c86",
      "user": {
        "_id": "60d21b4967d0d8992e610c87",
        "username": "janedoe",
        "profilePicture": "uploads/profiles/jane.jpg"
      },
      "contentType": "post",
      "contentId": "60d21b4967d0d8992e610c85",
      "comment": "Great post!",
      "createdAt": "2023-06-22T12:30:00.000Z"
    }
  }
}
```

#### Get Comments

```
GET /api/forum/comments/:contentType/:contentId
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "_id": "60d21b4967d0d8992e610c86",
        "user": {
          "_id": "60d21b4967d0d8992e610c87",
          "username": "janedoe",
          "profilePicture": "uploads/profiles/jane.jpg"
        },
        "comment": "Great post!",
        "createdAt": "2023-06-22T12:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Delete Comment

```
DELETE /api/forum/comments/:commentId
```

**Response:**
```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

#### Report Content

```
POST /api/forum/report
```

**Request Body:**
- `contentType` (string): 'post' or 'ritual'
- `contentId` (string): ID of the post or ritual
- `reason` (string): Reason for reporting

**Response:**
```json
{
  "status": "success",
  "message": "Content reported successfully"
}
```

#### Share Content

```
POST /api/forum/share
```

**Request Body:**
- `contentType` (string): 'post' or 'ritual'
- `contentId` (string): ID of the post or ritual
- `targetType` (string): 'circle' or 'user'
- `targetId` (string): ID of the circle or user

**Response:**
```json
{
  "status": "success",
  "data": {
    "interaction": {
      "_id": "60d21b4967d0d8992e610c8a",
      "user": "60d21b4967d0d8992e610c87",
      "contentType": "post",
      "contentId": "60d21b4967d0d8992e610c85",
      "type": "share",
      "shareTarget": {
        "type": "user",
        "id": "60d21b4967d0d8992e610c88"
      },
      "createdAt": "2023-06-22T16:00:00.000Z"
    }
  }
}
```

#### Get User's Interactions with Content

```
GET /api/forum/user-interaction/:contentType/:contentId
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "interactions": {
      "isUpvoted": true,
      "isDownvoted": false,
      "isSaved": true,
      "isReported": false,
      "comments": [
        {
          "_id": "60d21b4967d0d8992e610c86",
          "comment": "Great post!",
          "createdAt": "2023-06-22T12:30:00.000Z"
        }
      ],
      "shares": []
    }
  }
}
```

## The Rituals API

The Rituals module provides a habit tracking system with various features.

### Endpoints

#### Create a Ritual

```
POST /api/rituals
```

**Request Body (multipart/form-data):**
- `title` (string): Ritual title
- `description` (string): Ritual description
- `frequency` (string): 'daily', 'weekly', or 'monthly'
- `duration` (number): Duration in days
- `visibility` (string): 'public' or 'circle'
- `circleId` (string, required if visibility is 'circle'): ID of the circle
- `linkedPostId` (string, optional): ID of a post to link to this ritual
- `tags` (string): Comma-separated list of tags
- `files` (file, optional): Up to 5 media files (images/videos)

**Response:**
```json
{
  "status": "success",
  "data": {
    "ritual": {
      "_id": "60d21b4967d0d8992e610c88",
      "title": "Daily Meditation",
      "description": "10 minutes of mindfulness meditation every day",
      "creator": "60d21b4967d0d8992e610c85",
      "frequency": "daily",
      "duration": 30,
      "visibility": "public",
      "tags": ["meditation", "mindfulness"],
      "mediaUrls": ["uploads/rituals/image1.jpg"],
      "mediaType": "image",
      "stats": {
        "upvotes": 0,
        "downvotes": 0,
        "comments": 0,
        "shares": 0,
        "saves": 0,
        "adoptions": 0,
        "reports": 0
      },
      "createdAt": "2023-06-22T12:00:00.000Z",
      "updatedAt": "2023-06-22T12:00:00.000Z"
    }
  }
}
```

#### Get Rituals

```
GET /api/rituals
```

**Query Parameters:**
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 10): Number of rituals per page
- `visibility` (string, optional): Filter by visibility ('public' or 'circle')
- `circleId` (string, optional): Filter by circle ID (for 'circle' visibility)
- `sortBy` (string, default: 'latest'): Sort order ('latest', 'popular', 'adoptions')
- `tags` (string, optional): Filter by comma-separated tags

**Response:**
```json
{
  "status": "success",
  "data": {
    "rituals": [
      {
        "_id": "60d21b4967d0d8992e610c88",
        "title": "Daily Meditation",
        "description": "10 minutes of mindfulness meditation every day",
        "creator": {
          "_id": "60d21b4967d0d8992e610c85",
          "username": "johndoe",
          "profilePicture": "uploads/profiles/profile.jpg"
        },
        "frequency": "daily",
        "duration": 30,
        "visibility": "public",
        "tags": ["meditation", "mindfulness"],
        "mediaUrls": ["uploads/rituals/image1.jpg"],
        "mediaType": "image",
        "stats": {
          "upvotes": 10,
          "downvotes": 0,
          "comments": 5,
          "shares": 3,
          "saves": 8,
          "adoptions": 15,
          "reports": 0
        },
        "createdAt": "2023-06-22T12:00:00.000Z",
        "updatedAt": "2023-06-22T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

#### Get Ritual by ID

```
GET /api/rituals/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "ritual": {
      "_id": "60d21b4967d0d8992e610c88",
      "title": "Daily Meditation",
      "description": "10 minutes of mindfulness meditation every day",
      "creator": {
        "_id": "60d21b4967d0d8992e610c85",
        "username": "johndoe",
        "profilePicture": "uploads/profiles/profile.jpg"
      },
      "frequency": "daily",
      "duration": 30,
      "visibility": "public",
      "tags": ["meditation", "mindfulness"],
      "mediaUrls": ["uploads/rituals/image1.jpg"],
      "mediaType": "image",
      "stats": {
        "upvotes": 10,
        "downvotes": 0,
        "comments": 5,
        "shares": 3,
        "saves": 8,
        "adoptions": 15,
        "reports": 0
      },
      "createdAt": "2023-06-22T12:00:00.000Z",
      "updatedAt": "2023-06-22T12:00:00.000Z"
    },
    "comments": [
      {
        "_id": "60d21b4967d0d8992e610c89",
        "user": {
          "_id": "60d21b4967d0d8992e610c87",
          "username": "janedoe",
          "profilePicture": "uploads/profiles/jane.jpg"
        },
        "comment": "This ritual changed my life!",
        "createdAt": "2023-06-22T13:00:00.000Z"
      }
    ],
    "isUpvoted": false,
    "isSaved": true,
    "adoption": {
      "status": "active",
      "progress": 60,
      "startDate": "2023-06-23T10:00:00.000Z"
    }
  }
}
```

#### Update Ritual

```
PUT /api/rituals/:id
```

**Request Body:**
- `title` (string): Updated ritual title
- `description` (string): Updated ritual description
- `frequency` (string): Updated frequency
- `duration` (number): Updated duration
- `tags` (string): Updated comma-separated tags

**Response:**
```json
{
  "status": "success",
  "data": {
    "ritual": {
      "_id": "60d21b4967d0d8992e610c88",
      "title": "Updated Meditation Ritual",
      "description": "Updated description",
      "frequency": "daily",
      "duration": 45,
      "tags": ["meditation", "mindfulness", "health"],
      "updatedAt": "2023-06-22T14:00:00.000Z"
    }
  }
}
```

#### Delete Ritual

```
DELETE /api/rituals/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Ritual deleted successfully"
}
```

#### Adopt a Ritual

```
POST /api/rituals/:ritualId/adopt
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "adoption": {
      "_id": "60d21b4967d0d8992e610c8b",
      "user": "60d21b4967d0d8992e610c87",
      "ritual": "60d21b4967d0d8992e610c88",
      "status": "active",
      "progress": 0,
      "startDate": "2023-06-22T17:00:00.000Z",
      "createdAt": "2023-06-22T17:00:00.000Z",
      "updatedAt": "2023-06-22T17:00:00.000Z"
    }
  }
}
```

#### Update Adoption Progress

```
PUT /api/rituals/adoption/:adoptionId/progress
```

**Request Body:**
- `progress` (number): Progress percentage (0-100)

**Response:**
```json
{
  "status": "success",
  "data": {
    "adoption": {
      "_id": "60d21b4967d0d8992e610c8b",
      "status": "active",
      "progress": 75,
      "updatedAt": "2023-06-22T18:00:00.000Z"
    }
  }
}
```

#### Abandon Adoption

```
PATCH /api/rituals/adoption/:adoptionId/abandon
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "adoption": {
      "_id": "60d21b4967d0d8992e610c8b",
      "status": "abandoned",
      "abandonedDate": "2023-06-22T19:00:00.000Z",
      "updatedAt": "2023-06-22T19:00:00.000Z"
    },
    "message": "Ritual abandoned successfully"
  }
}
```

#### Get User's Adoptions

```
GET /api/rituals/user/adoptions
```

**Query Parameters:**
- `status` (string, optional): Filter by status ('active', 'completed', 'abandoned')
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "adoptions": [
      {
        "_id": "60d21b4967d0d8992e610c8b",
        "ritual": {
          "_id": "60d21b4967d0d8992e610c88",
          "title": "Daily Meditation",
          "description": "10 minutes of mindfulness meditation every day",
          "frequency": "daily",
          "duration": 30,
          "stats": {
            "upvotes": 10,
            "adoptions": 15
          },
          "creator": {
            "_id": "60d21b4967d0d8992e610c85",
            "username": "johndoe",
            "profilePicture": "uploads/profiles/profile.jpg"
          }
        },
        "status": "active",
        "progress": 75,
        "startDate": "2023-06-22T17:00:00.000Z",
        "createdAt": "2023-06-22T17:00:00.000Z",
        "updatedAt": "2023-06-22T18:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Interaction Endpoints

The Rituals module shares the same interaction endpoints as the Forum module. You can use the Forum interaction endpoints for rituals by specifying the contentType as 'ritual' instead of 'post'.

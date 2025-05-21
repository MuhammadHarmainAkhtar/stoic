# Report System Documentation

## Overview

The Stoic application includes a private reporting system that allows users to report inappropriate content (posts or rituals). Reports are handled separately from regular interactions to ensure privacy and proper administrative review.

## Reporting Flow

1. **User reports content**: When a user finds inappropriate content, they can report it using the `/api/forum/report` or `/api/rituals/report` endpoints.

2. **Report storage**: Reports are stored in a separate `reports` collection in the database, completely isolated from regular user interactions.

3. **Admin review**: Administrators can review reports through dedicated admin endpoints.

4. **Action**: Admins can take appropriate actions (dismiss reports, remove content, etc.) based on their review.

## Data Structure

### Report Model

```typescript
{
  reporter: ObjectId,       // User who submitted the report
  contentType: String,      // "post" or "ritual"
  contentId: ObjectId,      // ID of the reported content
  reason: String,           // Reason for reporting
  status: String,           // "pending", "reviewed", "dismissed", "action_taken"
  adminNotes: String,       // Optional notes added by the admin
  reviewedAt: Date,         // When the report was reviewed
  createdAt: Date,          // When the report was created
  updatedAt: Date           // When the report was last updated
}
```

## API Endpoints

### User Endpoints

- **POST /api/forum/report** - Report a post
  - Body: `{ contentType, contentId, reason }`

### Admin Endpoints

- **GET /api/admin/reports** - Get all reports with filtering and pagination
  - Query params: `page`, `limit`, `status`, `contentType`, `sortBy`

- **GET /api/admin/reports/:id** - Get detailed information about a specific report

- **PATCH /api/admin/reports/:id** - Update a report's status
  - Body: `{ status, adminNotes }`

## Report Status Workflow

1. **PENDING** - New report, awaiting admin review
2. **REVIEWED** - Admin has reviewed the report but has not taken action yet
3. **DISMISSED** - Admin determined no action was needed
4. **ACTION_TAKEN** - Admin took action based on the report

## Security

- Only authenticated users can submit reports
- Only administrators can view and manage reports
- Content creators are not notified when their content is reported
- Report data is isolated from regular interaction data

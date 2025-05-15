# Admin Protection Features

This document outlines the special protection mechanisms implemented for admin users in the Stoic application, particularly for the main admin user with ID: `682499455e350516d6b68915`.

## Main Admin Protection

### Circle Membership

1. **Auto-membership**: The main admin user is automatically added as a member to all newly created circles, both default circles and user-created circles that are approved through the request system.

2. **Removal Protection**: Circle gurus cannot remove the main admin from their circles. Only the admin themselves can voluntarily leave a circle.

3. **Notifications**: 
   - When the main admin leaves a circle, a notification is sent to the circle guru.
   - When any user leaves a circle, a notification is sent to the main admin.

### Circle Administration

1. **Admin Routes**: Special admin routes are available for:
   - Removing gurus from circles
   - Removing inappropriate content
   - Inviting users to become gurus of circles

2. **Default Circles**: The main admin is automatically set as the guru of all default circles.

3. **Guru Invites**: The admin can invite users to become gurus of any circle.

## Implementation Details

### Protected Routes

All admin-specific routes are protected with middleware that checks for admin privileges:

```typescript
router.use(protect);       // Authentication check
adminRouter.use(restrictToAdmin);  // Admin authorization check
```

### Membership Protection Logic

The check that prevents gurus from removing the main admin:

```typescript
// Check if the user is the main admin (cannot be removed)
const isMainAdmin = memberUserId.toString() === "682499455e350516d6b68915";
if (isMainAdmin) {
  return res.status(403).json({
    status: "error",
    message: "The main administrator cannot be removed from circles. Only they can leave voluntarily.",
  });
}
```

### Notification System

Notifications are sent using the NotificationType enum:

```typescript
export enum NotificationType {
  // ... other types ...
  CIRCLE_ADMIN_ACTION = "circle_admin_action",
  CIRCLE_MEMBER_LEAVE = "circle_member_leave",
  CIRCLE_GURU_INVITE = "circle_guru_invite",
}
```

## Maintenance

To maintain these protections when making changes to the circle membership system:

1. Always consider the special role of the main admin user with ID `682499455e350516d6b68915`
2. Preserve the protection logic in `removeCircleMember` and `leaveCircle` functions
3. Ensure that any new circle creation logic includes automatically adding the main admin as a member
4. Maintain the notification system for admin actions and user departures

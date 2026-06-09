# Notification System Design

## Stage 1: REST API Design & JSON Schemas
### Core Actions
1. **Send Notification**: Trigger a notification to a specific user.
2. **Get User Notifications**: Retrieve history/unread notifications.
3. **Mark as Read**: Update status of a specific notification.
4. **User Preferences**: Manage channel settings (Email/SMS/Push).

### Endpoints
- `POST /api/v1/notifications`
- `GET /api/v1/notifications/user/{userId}`
- `PATCH /api/v1/notifications/{notificationId}/read`
- `PUT /api/v1/users/{userId}/preferences`

### JSON Schemas
**Notification Payload:**
```json
{
  "userId": "string",
  "type": "Placement | Event | Result",
  "message": "string",
  "metadata": {
    "company": "string",
    "date": "string"
  }
}
```

---

## Stage 2: Persistent Storage (DB)
### Database Choice: PostgreSQL (Relational)
**Rationale:** 
- **ACID Compliance**: Ensures notification status (Sent/Read) is consistent.
- **Structured Data**: Notification types and user relations are highly structured.
- **Complex Queries**: Efficiently handles filtering by user and sorting by time.

### Schema
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Placement', 'Event', 'Result')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Stage 3: Performance Optimization
### Indexing Strategy
- **Index**: `CREATE INDEX idx_user_unread ON notifications (user_id, is_read, created_at DESC);`
- **Why?**: This covers the most frequent query: fetching a student's unread notifications in reverse chronological order.
- **Caution**: Excessive indexing increases storage and slows down `INSERT` operations as indexes must be updated.

---

## Stage 4: Scalability Solutions
**Problem**: DB bottleneck during peak loads (e.g., mass placement result).
**Solutions**:
1. **Caching**: Use Redis to store the latest 50 notifications for active users.
2. **Read Replicas**: Offload `GET` requests to replica databases.
3. **Database Sharding**: Partition data by `user_id` range across multiple DB instances.

---

## Stage 5: Bulk Notifications Redesign
### SHORTCOMINGS of the provided implementation:
1. **Blocking/Synchronous**: One failure (e.g., Email API timeout) halts the entire loop.
2. **Performance**: Processing 50,000 students sequentially is extremely slow.
3. **DB Pressure**: 50,000 individual `INSERT` statements in a loop will crash the DB.

### REDESIGN (Pseudocode):
```javascript
async function notify_all_v2(student_ids, message) {
    // 1. Bulk insert into DB (Single query)
    await db.notifications.bulkCreate(student_ids.map(id => ({ user_id: id, message })));
    
    // 2. Push IDs to Message Queue (RabbitMQ/Kafka)
    for (const id of student_ids) {
        await messageQueue.push('notification_task', { student_id: id, message });
    }
}

// 3. Workers consume from queue and call external APIs in parallel
```

---

## Stage 6: Priority Inbox Implementation
### Priority Weightage
- **Placement** (Weight: 3) > **Result** (Weight: 2) > **Event** (Weight: 1)
- **Recency**: Newer notifications have higher scores.
- **Unread**: Only display top 10 unread.

# Room Persistence Test Guide

## How to Test Room Persistence

### Test 1: Creator Refresh
1. Go to http://localhost:3000
2. Create a new room (note the room ID and access code)
3. Join the room with your name
4. Note that you are the host (can set story, reveal/reset votes)
5. **Refresh the browser (F5)**
6. You should:
   - Automatically rejoin the room
   - Still be the host
   - See the same room state

### Test 2: Multiple Users
1. Create a room in one browser/tab
2. Join with another browser/tab
3. Have the creator (host) refresh their browser
4. The host should rejoin and maintain host privileges
5. The other user should see the host briefly disconnect and reconnect

### Test 3: Room Cleanup Timer
1. Create a room and join it
2. Leave the room (click Leave button)
3. Within 60 seconds, try to rejoin using the same URL
4. The room should still exist and you can rejoin
5. After 60 seconds, the room will be deleted

### What's Happening Behind the Scenes

1. **Room Persistence**: Rooms now stay alive for 60 seconds after becoming empty
2. **Session Storage**: Your session (name, access code, vote) is saved in localStorage
3. **Auto-Rejoin**: On page refresh, you automatically rejoin with saved credentials
4. **Host Restoration**: Original host can reclaim host status when reconnecting
5. **Cleanup Timer**: Empty rooms are deleted after 60 seconds to prevent memory leaks

### Console Logs to Watch

In the browser console:
- "Socket connected, checking for saved session..."
- "Found saved session: {data}"
- "Session is valid, auto-joining room..."

In the server console:
- "Room {id} is now empty, scheduling cleanup in 60 seconds"
- "Cancelled cleanup timer for room {id} - user rejoined"
- "User {name} successfully joining room {id}"
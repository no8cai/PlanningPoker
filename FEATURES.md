# Planning Poker - Feature Update

## 🎯 New Features Added

### 1. Card Values Updated
- **Removed**: 0, 40, 100 points
- **Current cards**: 0.5, 1, 2, 3, 5, 8, 13, 20, ?
- Follows standard Fibonacci sequence up to 20

### 2. Share Link Feature
- **Share Button** in room header with multiple options:
  - Copy link to clipboard
  - Share via WhatsApp
  - Share via Email
  - Native mobile share (on supported devices)
- Shows confirmation toast when link is copied
- Room URL format: `http://yoursite.com/room/{roomId}`

### 3. Mobile Optimizations

#### Responsive Design
- **Cards**: Grid layout (3 columns) on mobile
- **User list**: Moves to top on mobile for better visibility
- **Buttons**: Full width on mobile screens
- **Header**: Stacks vertically on small screens
- **Emoji picker**: Fixed position at bottom right on mobile

#### Touch Interactions
- Tap highlight removed for cleaner interaction
- Active states for better feedback
- Prevent accidental zoom on input focus
- Smooth touch scrolling

#### Viewport Settings
- Prevents zoom on double-tap
- Full viewport coverage
- iOS status bar support
- Landscape orientation support

### 4. Enhanced Animations (Previously Added)
- Animated gradient backgrounds
- Floating emoji reactions with usernames
- Confetti animation on vote reveal
- Card bounce and flip animations
- Glass morphism UI effects

## 📱 Mobile Usage

### Sharing a Room
1. Create or join a room
2. Tap the "Share" button
3. Choose sharing method:
   - Copy link for manual sharing
   - WhatsApp for instant messaging
   - Email for formal invitations

### Mobile Voting
1. Tap cards to vote (they'll shrink slightly for feedback)
2. Swipe to see all users in the list
3. Send emojis with the floating button
4. All animations are optimized for mobile performance

## 🔗 Share Link Format
```
http://localhost:3000/room/918434a9-9e5a-47ba-864f-595a92005ccf
```

Users can join directly by:
1. Clicking the shared link
2. Entering their name
3. Starting to vote immediately

## 📱 Tested On
- iOS Safari
- Chrome Mobile
- Android WebView
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## 🎨 Mobile-First Features
- **Responsive breakpoints**: 768px, 600px, 480px
- **Touch-optimized tap targets**: Minimum 44x44px
- **Performance**: Hardware-accelerated animations
- **Accessibility**: Large fonts, high contrast
- **PWA Ready**: Can be added to home screen
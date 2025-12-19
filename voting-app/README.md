# Voting App

A full-stack polling application where users can create polls, vote on topics, view results in interactive charts, and share polls with others. Features real-time updates and a modern, responsive design.

## Features

- **GitHub OAuth Authentication** - Secure login with GitHub accounts
- **Create Custom Polls** - Add any number of options with dynamic form
- **Vote on Polls** - One-vote-per-user with instant feedback
- **Interactive Charts** - View results in beautiful Chart.js visualizations
- **Poll Management** - Keep track of your polls and delete when needed
- **Add Custom Options** - Suggest new options to existing polls
- **Share Polls** - Generate shareable links for any poll
- **Real-time Updates** - See results update instantly (no page refresh needed)
- **Responsive Design** - Works perfectly on desktop and mobile

## User Stories Implemented

✅ **As an authenticated user, you can keep my polls and come back later to access them.**
- User dashboard shows all polls created by the logged-in user
- Persistent storage in MongoDB with user association

✅ **As an authenticated user, you can share my polls with my friends.**
- One-click share button generates direct links to polls
- Clipboard integration for easy sharing
- Dedicated poll pages for shared links

✅ **As an authenticated user, you can see the aggregate results of my polls.**
- Comprehensive results view with vote counts and percentages
- Interactive charts showing voting distribution
- Real-time updates as new votes come in

✅ **As an authenticated user, you can delete polls that I decide I don't want anymore.**
- Delete button on user's own polls
- Confirmation dialog to prevent accidental deletion
- Secure ownership verification

✅ **As an authenticated user, you can create a poll with any number of possible items.**
- Dynamic form allowing 2-10 options
- Add/remove options during creation
- Validation ensures minimum requirements

✅ **As an unauthenticated or authenticated user, you can see and vote on everyone's polls.**
- Public poll browsing without login
- Voting requires authentication with clear messaging
- Seamless experience between logged-in and guest users

✅ **As an unauthenticated or authenticated user, you can see the results of polls in chart form.**
- Chart.js powered doughnut charts
- Percentage breakdowns and vote counts
- Responsive chart sizing

✅ **As an authenticated user, if you don't like the options on a poll, you can create a new option.**
- Add custom options to any existing poll
- Validation prevents duplicate options
- Immediate UI updates

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.IO
- **Authentication**: Passport.js with GitHub OAuth
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Real-time**: WebSocket communication with Socket.IO
- **Database**: MongoDB for poll and user data
- **Charts**: Chart.js for interactive visualizations

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3001/auth/github/callback`

3. **Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/votingapp
   SESSION_SECRET=your_session_secret_here
   PORT=3001
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Access the application:**
   Open `http://localhost:3001` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - OAuth callback
- `GET /logout` - User logout
- `GET /poll/:id` - Shared poll page
- `GET /api/polls` - Get all polls
- `GET /api/my-polls` - Get user's polls (authenticated)
- `POST /api/polls` - Create new poll (authenticated)
- `DELETE /api/polls/:id` - Delete poll (authenticated, owner only)
- `POST /api/polls/:id/vote` - Vote on poll (authenticated)
- `POST /api/polls/:id/options` - Add option to poll (authenticated)
- `GET /api/polls/:id/share` - Get shareable poll URL
- `GET /api/polls/:id` - Get specific poll details
- `GET /api/user` - Get current user info (authenticated)

## Architecture

```
voting-app/
├── server.js           # Express server with GitHub auth & WebSocket support
├── public/
│   ├── index.html      # Main voting app interface
│   ├── login.html      # GitHub OAuth login page
│   ├── poll.html       # Shared poll viewing page
│   ├── script.js       # Frontend logic with real-time updates
│   └── styles.css      # Modern responsive styling
├── package.json        # Dependencies & scripts
├── .env               # Environment configuration
└── README.md          # Complete documentation
```

## Key Features

### Poll Creation & Management
- **Dynamic Forms**: Add/remove options during poll creation
- **Validation**: Ensures proper poll structure and prevents duplicates
- **Ownership**: Users can only modify their own polls
- **Persistence**: All polls stored securely in MongoDB

### Voting System
- **One Vote Per User**: Prevents multiple votes using localStorage tracking
- **Real-time Updates**: Results update instantly for all viewers
- **Authentication Required**: Clear messaging for voting requirements
- **Instant Feedback**: Toast notifications confirm actions

### Chart Visualization
- **Interactive Charts**: Chart.js powered doughnut charts
- **Responsive Design**: Charts adapt to screen size
- **Percentage Breakdowns**: Clear vote distribution display
- **Live Updates**: Charts update as new votes arrive

### Sharing & Social Features
- **Direct Links**: Shareable URLs for any poll
- **Clipboard Integration**: One-click copying of share links
- **Public Access**: Anyone can view and vote on shared polls
- **SEO Friendly**: Clean URLs for poll sharing

### Real-time Collaboration
- **WebSocket Communication**: Instant updates across all users
- **Live Notifications**: See when others vote or add options
- **No Refresh Required**: All updates happen automatically
- **Scalable Architecture**: Built for multiple concurrent users

## Usage Examples

### Creating a Poll
1. Login with GitHub
2. Click "Create Poll"
3. Enter poll title and options
4. Add/remove options as needed
5. Click "Create Poll"

### Voting on a Poll
1. Browse polls on the main page
2. Click on any poll to view details
3. Select your preferred option
4. Results appear immediately

### Managing Your Polls
1. Click "My Polls" in navigation
2. View all polls you've created
3. Delete polls you no longer want
4. Share polls with others

### Adding Custom Options
1. View any poll (yours or others)
2. If logged in and haven't voted, see "+" button
3. Click to add a custom option
4. Option appears immediately for voting

## Security Features

- **GitHub OAuth**: Secure authentication without password storage
- **Session Management**: Proper session handling with MongoDB store
- **Input Validation**: Server-side validation for all user inputs
- **Ownership Verification**: Users can only modify their own polls
- **XSS Protection**: Proper escaping of user-generated content

## FreeCodeCamp Certification

This implementation fulfills all requirements for the "Build a Voting App" project in the FreeCodeCamp Back End Development and APIs certification.

**Solution Link:** http://localhost:3001
**Source Code Link:** https://github.com/Jules369-ZM/LegacyFullStackCertification

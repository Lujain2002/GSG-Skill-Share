## SkillShare

### What is SkillShare?
SkillShare is a peer-to-peer learning exchange: teach something you know, learn something new from another member, and keep track of it all with a simple points balance. This prototype showcases the first slice of that experience in a lightweight, local-first app.

### What you can do
- **Create an account in seconds.** Set up a basic profile and come back to it any time.
- **List the skills you can teach.** Add categories, confidence levels, and short notes so others know what to expect.
- **Share the skills you want to learn.** Let the community see what knowledge you’re looking for.
- **Browse your matches.** The app spots overlaps between your teach/learn lists and suggests the best peers to connect with.
- **Book sessions.** Send a session request, confirm the details, and track the outcome.
- **Earn and spend points.** Teaching rewards you; learning spends your balance. Everything stays inside the app’s simple ledger.

### How it flows
1. **Set up your profile.** Add a few skills you’re confident teaching and a few you’re eager to learn.
2. **Explore matches.** Filter by category, focus on fresh opportunities, and open profiles to see more detail.
3. **Request a session.** Choose a timeslot length, send the booking, and let the other person confirm.
4. **Complete or cancel.** Mark sessions when they’re finished (teachers earn points) or cancel if plans change (learners get points back).

### Points at a glance
- Everyone starts with **10 points** when they join.
- Teaching awards **5 points for every half hour** you deliver.
- Booking a lesson uses the same rate, deducted at the time of booking.
- Cancelling a booking before it happens returns the learner’s points automatically.

### Why people like it
- Makes it easy to give and receive help without cash.
- Encourages short, focused lessons that fit into busy schedules.
- Keeps both sides accountable with a transparent history of bookings and points.


### Usage Tips

```cmd
npm install
npm run dev
```

Open the shown localhost URL.
1. Register first user (e.g. Alice) – add skills she can teach and wants to learn.
2. Logout, register a second user (Bob) with complementary skills.
3. Login as a learner, open Matches, book a session with a teacher.
4. Switch to teacher account, complete session to earn points.

### Demo Video
<video src="./src/context/Demo.mp4" controls width="820" style="max-width:100%; border-radius:12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);"></video>
<br/>
<sub>If the player doesn’t appear, you can download the video directly: <a href="./src/context/Demo.mp4">Demo.mp4</a></sub>

### API Documentation
- Full Postman collection and reference: [SkillShare API Docs](https://www.postman.com/unlogybackend/projects/documentation/punj9zu/skillshare)

### Points Rules
- Start: 10 points on registration.
- Earn: 5 points per 30 minutes taught.
- Spend: same rate when booking (deduct at booking time).
- Cancel: refunds learner if not completed.

### Roadmap (Next)
- Availability scheduling & calendar integration
- Ratings & reviews
- Chat & notifications
- Enhanced matching algorithm (availability, preferences)


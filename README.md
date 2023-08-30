# ContentApi

Content Management API for Live Church Solutions

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).

### Dev Setup Instructions

1. Create a MySQL database named `content`.
2. Copy `dotenv.sample.txt` to `.env` and edit it to point to your MySQL database.
3. Install the dependencies with: `npm install`
4. Create the database tables with `npm run initdb`
5. Start the api with `npm run dev`

# analyze-telegram-data

## Prelude

Sometimes you think that it'd be cool to have stats over your life. How many bananas have you eaten.. and that kind of stuff. This is the next best thing to it.

I noticed that many of my chats have almost 200,000 messages. That's a lot of helpful information, links, images around events... anything really. In our case it was just a lot of shitposting but the helpful stuff isn't fun anyways.

Telegram allows us to export data in a machine-readable JSON so I've gathered some helpers to do stuff with it.
I'll also guide you how to export Telegram chats to your PostgreSQL database.

## Prequisities

- **Postgres** - for importing the data to a certain table
- **Node** - (preferably v12+) I like to use TypeScript
- **Python 3** - for generating new chat messages from previous data (markov chain)

## Exporting the data from Telegram

Make sure you have the universal Telegram version (PC/Mac/Linux).

1. Telegram > Settings > Advanced > Export Telegram data
2. Tick **only** the private groups box. The usecase I had only analyzes private groups' data so that's what you might want too.
3. Set this folder (analyze-telegram-data) repo to your _Download folder_.
4. Select _Machine-readable JSON_.
5. Export.

## Importing the data to SQL

### TL;DR

1. `cp .env.example .env`
2. `npm run migrate`
3. `npm run import-data`

### Further explained

Configure your `.env` according to `.env.example`. It basically just needs your DB host, username, password and database.
Often the host is `localhost` and the other values `postgres`.

I have created a migration file you can use to run the data into database. You can find it from `./migrations`. You can run that directly on your SQL client, or just running `npm run migrate`.

`npm run import-data` will import the data to your database, finding `./DataExport_*` folders from the repository root. You can also provide path to result.json: `npm run import-data /Users/prou/Projects/analyze-telegram-data/DataExport_18_09_2019/result.json`.

Depending on your dataset and machine this can take some time.

# analyze-telegram-data

## Prelude

Sometimes you think that it'd be cool to have stats over your life. How many bananas have you eaten.. and that kind of stuff. This is the next best thing to it.

I noticed that many of my chats have almost 200,000 messages. That's a lot of helpful information, links, images around events... anything really. In our case it was just a lot of shitposting.

Telegram allows us to export data in a machine-readable JSON so I've gathered some helpers to do stuff with it.
I'll also guide you how to export Telegram chats to your PostgreSQL database.

## Prerequisites

- **Postgres** - for importing the data to a certain table
- **Python 3** - for generating new chat messages from previous data (markov chain)
- **jq** - for transforming Telegram JSON to PostgreSQL readable CSV.

## Exporting the data from Telegram

Make sure you have the universal Telegram version (PC/Mac/Linux).

1. Telegram > Settings > Advanced > Export Telegram data
2. Tick **only** the private groups box. The use case I had only analyzes private groups' data so that's what you might want too.
3. Select _Machine-readable JSON_.
4. Export.

## Importing the data to Postgres

1. (`pip3 install pipenv`)
2. `pipenv install`
3. `export DATABASE_URL=postgresql://postgres:postgres@localhost/postgres`
4. `psql "$DATABASE_URL" -f ./sql/create-tables.sql`
5.
```cat ./source/DataExport_18_09_2019/result.json \
| jq -r '.chats.list | ["id", "name", "type"] as $cols | $cols, map(. as $row | $cols | map($row[.]))[] | @csv' \
| psql "$DATABASE_URL" -c "COPY chats FROM STDIN DELIMITER ',' CSV HEADER"

cat ./source/DataExport_18_09_2019/result.json \
| jq -r '.chats.list[] as $parent | $parent.messages | . = [ .[] | .chat_id = $parent.id ] | (map(keys) | add | unique) as $cols | $cols, map(. as $row | $cols | map($row[.]|tostring))[] | @csv' \
| psql "$DATABASE_URL" -c "COPY messages FROM STDIN DELIMITER ',' CSV HEADER"
```

Depending on your dataset and machine this can take some time.

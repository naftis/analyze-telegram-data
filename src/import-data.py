import sys
import json
import psycopg2.extras
import os

if 'DATABASE_URL' not in os.environ:
    print('Please set the environment variable DATABASE_URL')
    sys.exit(1)

print('⌛ Loading stdin to memory...')
data = json.load(sys.stdin)
chats = []
messages = []

for chat in data['chats']['list']:
    chats.append({
        'id': chat['id'],
        'name': chat['name'],
        'type': chat['type']
    })

    for message in chat['messages']:
        messages.append({
            'chat_id': chat['id'],
            **message
        })
print(f'✅ ...loaded {len(chats)} chats and {len(messages)} messages')
conn = psycopg2.connect(os.getenv('DATABASE_URL'))

with conn.cursor() as cur:
    print(f'⌛ Inserting chats...')
    cur.execute(
        'INSERT INTO chats SELECT * FROM json_populate_recordset(null::chats, %s)', (json.dumps(chats),))
    print('✅ ...inserted')
    print(f'⌛ Inserting messages...')
    cur.execute('INSERT INTO messages SELECT * FROM json_populate_recordset(null::messages, %s)',
                (json.dumps(messages),))
    conn.commit()
    print('✅ ...inserted')
    cur.close()

conn.close()

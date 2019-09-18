import * as fs from "fs";
import * as path from "path";
import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const DATA_EXPORT_PREFIX = "DataExport_";

async function getNewestDataExportDir() {
  const directories = await fs.promises.readdir("./");
  const dataExportDirs = directories
    .filter(directory => directory.startsWith(DATA_EXPORT_PREFIX))
    .map(directory => {
      const dirSplits = directory.split("_");
      const date = `${dirSplits[3]}/${dirSplits[2]}/${dirSplits[1]}`;

      return {
        date: new Date(date),
        directory
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  if (dataExportDirs[0]) {
    return dataExportDirs[0].directory;
  }

  throw new Error("No data export directory found");
}

async function getChats(resultJsonUri?: string) {
  let fileUri = resultJsonUri;

  if (!resultJsonUri) {
    const dir = await getNewestDataExportDir();
    fileUri = path.join(dir, "result.json");
  }

  const resultFile = await fs.promises.readFile(fileUri || "");
  const result = JSON.parse(resultFile.toString());

  return result.chats.list as any[];
}

async function getMessages(chats: any[]) {
  const list = chats.flatMap((chat: any) =>
    chat.messages.map((message: any) => ({
      ...message,
      chat_id: chat.id
    }))
  );

  return list;
}

async function run() {
  const resultJsonUri = process.argv[process.argv.length - 1];
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  let chats: any[];

  if (resultJsonUri.endsWith(".json")) {
    chats = await getChats(resultJsonUri);
  } else {
    chats = await getChats();
  }

  const messages = await getMessages(chats);
  const relevantChatData = chats.map(chat => ({
    id: chat.id,
    name: chat.name,
    type: chat.type
  }));

  await client.query(
    `
      INSERT INTO chats (
        id,
        name,
        type
      )
      SELECT m.* FROM json_populate_recordset(null::chats, $1) AS m
  `,
    [JSON.stringify(relevantChatData)]
  );

  await client.query(
    `
      INSERT INTO messages (
        id,
        type,
        date,
        edited,
        actor,
        actor_id,
        action,
        title,
        "from",
        from_id,
        text,
        members,
        photo,
        width,
        height,
        reply_to_message_id,
        file,
        thumbnail,
        media_type,
        sticker_emoji,
        mime_type,
        duration_seconds,
        forwarded_from,
        poll,
        message_id,
        via_bot,
        performer,
        location_information,
        contact_information,
        contact_vcard,
        chat_id
      )
      SELECT m.* FROM json_populate_recordset(null::messages, $1) AS m
  `,
    [JSON.stringify(messages)]
  );

  await client.end();
}

run();

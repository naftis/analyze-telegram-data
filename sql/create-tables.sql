CREATE TABLE chats (
  id character varying(255) PRIMARY KEY,
  name character varying(255),
  type character varying(255)
);

CREATE TABLE messages (
  id bigint NOT NULL,
  type character varying(255),
  date timestamp without time zone,
  edited timestamp without time zone,
  actor character varying(255),
  actor_id bigint,
  action character varying(255),
  title character varying(255),
  "from" character varying(255),
  from_id bigint,
  text text,
  members text,
  photo character varying(255),
  width integer,
  height integer,
  reply_to_message_id bigint,
  file character varying(255),
  thumbnail character varying(255),
  media_type character varying(255),
  sticker_emoji character varying(255),
  mime_type character varying(255),
  duration_seconds integer,
  forwarded_from character varying(255),
  poll text,
  message_id bigint,
  via_bot character varying(255),
  performer text,
  location_information text,
  contact_information text,
  contact_vcard text,
  chat_id character varying(255) NOT NULL REFERENCES chats(id)
);

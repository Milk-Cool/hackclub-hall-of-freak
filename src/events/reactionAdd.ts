import { App } from "@slack/bolt";
import { StarboardDatabase } from "../index";

const reactionAddEvent = async (app: App): Promise<void> => {
  app.event("reaction_added", async ({ event, client }) => {
    if (event.reaction !== "star") return;

    let [entry] = await StarboardDatabase.read({
      filterByFormula: `{Message ID}="${event.item["ts"]}"`,
      maxRecords: 1,
    });

    if (entry === undefined) {
      // Create the entry
      await StarboardDatabase.create({
        "Message ID": event.item["ts"],
        "Channel ID": event.item["channel"],
        Stars: 1,
      });

      return;
    }

    // Add the star
    [entry] = await StarboardDatabase.updateWhere(
      `{Message ID}="${event.item["ts"]}"`,
      {
        Stars: (entry.fields["Stars"] as number) + 1,
      }
    );

    if (entry.fields["Stars"] >= 3) {
      const { permalink } = await client.chat.getPermalink({
        channel: event.item["channel"],
        message_ts: event.item["ts"],
      });

      if (entry.fields["Posted Message ID"]) {
        // Message already posted, so update
        const text = `⭐ *${entry.fields["Stars"]}*\n${permalink}`;

        await client.chat.update({
          channel: "C028VGT0JMQ",
          ts: entry.fields["Posted Message ID"] as string,
          text,
        });
      } else {
        // Post new message
        const message = `⭐ *${entry.fields["Stars"]}*\n${permalink}`;

        const posted = await client.chat.postMessage({
          channel: "C028VGT0JMQ",
          text: message,
        });

        await StarboardDatabase.updateWhere(
          `{Message ID}="${event.item["ts"]}"`,
          {
            "Posted Message ID": posted.ts,
          }
        );
      }
    }
  });
};

export default reactionAddEvent;

import { App, ReactionMessageItem } from "@slack/bolt";
import { StarboardDatabase } from "../index";

const reactionRemoveEvent = async (app: App): Promise<void> => {
  app.event("reaction_removed", async ({ event, client }) => {
    if ((event.item as ReactionMessageItem).channel === "C028VGT0JMQ") return;
    if (event.reaction !== "star") return;

    let [entry] = await StarboardDatabase.read({
      filterByFormula: `{Message ID}="${event.item["ts"]}"`,
      maxRecords: 1,
    });

    if (entry === undefined) return;

    // Remove a star, if one can be removed
    if (entry.fields["Stars"] >= 1) {
      [entry] = await StarboardDatabase.updateWhere(
        `{Message ID}="${event.item["ts"]}"`,
        {
          Stars: (entry.fields["Stars"] as number) - 1,
        }
      );
    }

    if (entry.fields["Posted Message ID"] && entry.fields["Stars"] < 3) {
      await client.chat.delete({
        channel: "C028VGT0JMQ",
        ts: entry.fields["Posted Message ID"] as string,
      });

      await StarboardDatabase.updateWhere(
        `{Message ID}="${event.item["ts"]}"`,
        {
          "Posted Message ID": "",
        }
      );
    } else if (entry.fields["Posted Message ID"]) {
      const { permalink } = await client.chat.getPermalink({
        channel: event.item["channel"],
        message_ts: event.item["ts"],
      });

      const text = `⭐ *${entry.fields["Stars"]}*\n${permalink}`;

      await client.chat.update({
        channel: "C028VGT0JMQ",
        ts: entry.fields["Posted Message ID"] as string,
        text,
      });
    }
  });
};

export default reactionRemoveEvent;

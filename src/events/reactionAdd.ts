import { App, ReactionMessageItem } from "@slack/bolt";
import prisma from "../utils/prisma";

const reactionAddEvent = async (app: App): Promise<void> => {
  app.event("reaction_added", async ({ event, client }) => {
    if ((event.item as ReactionMessageItem).channel === "C028VGT0JMQ") return;
    if (event.reaction !== "star") return;

    let entry = await prisma.message.findFirst({
      where: {
        messageId: event.item["ts"],
      }
    });

    if (entry === null) {
      // Create the entry
      await prisma.message.create({
        data: {
          messageId: event.item["ts"],
          channelId: event.item["channel"],
          stars: 1,
        }
      });

      return;
    }

    // Add the star
    entry = await prisma.message.update(
      {
        where: {
          messageId: event.item["ts"],
        },
        data: {
          stars: entry.stars + 1,
        }
      }
    );

    if (entry.stars >= 3) {
      const { permalink } = await client.chat.getPermalink({
        channel: event.item["channel"],
        message_ts: event.item["ts"],
      });

      if (entry.postedMessageId) {
        // Message already posted, so update
        const text = `⭐ *${entry.stars}*\n${permalink}`;

        await client.chat.update({
          channel: "C028VGT0JMQ",
          ts: entry.postedMessageId as string,
          text,
        });
      } else {
        // Post new message
        const message = `⭐ *${entry.stars}*\n${permalink}`;

        const posted = await client.chat.postMessage({
          channel: "C028VGT0JMQ",
          text: message,
        });

        await prisma.message.update(
          {
            where: {
              messageId: event.item["ts"],
            },
            data: {
              postedMessageId: posted.ts,
            }
          }
        );
      }
    }
  });
};

export default reactionAddEvent;

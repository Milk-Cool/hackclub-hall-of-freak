import { App } from "@slack/bolt";

const channelCreateEvent = async (app: App): Promise<void> => {
  app.event("channel_created", async ({ event, client }) => {
    try {
      await client.conversations.join({ channel: event.channel.id });
      await client.chat.postMessage({
        channel: event.channel.id,
        text: "Hey! I'm Ninja Ten Thousand, and I keep an eye out for messages (3+ :star: reactions) worthy of the hall of fame! If you'd like to opt-out and remove me from the channel, just press the button. You can add me back at any time!",
        blocks: [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Hey! I'm Ninja Ten Thousand, and I keep an eye out for messages (3+ :star: reactions) worthy of the <#C028VGT0JMQ>! If you'd like to opt-out and remove me from the channel, just press the button. You can add me back at any time!"
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Remove Me",
                "emoji": true
              },
              "value": "remove",
              "action_id": "remove"
            }
          ]
        }]
      })
    } catch (e) {
      console.error(e);
    }
  });

  app.action("remove", async ({ ack, say, body}) => {
    await ack();

    try {
      await say("Leaving!");

      await app.client.conversations.leave({
        channel: body.channel.id
      }); 
    } catch {
      console.log("failed to remove")
    }
  })
};

export default channelCreateEvent;

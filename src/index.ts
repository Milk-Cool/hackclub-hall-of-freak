import * as dotenv from "dotenv";
import { App, ExpressReceiver, SocketModeReceiver } from "@slack/bolt";
import * as events from "./events/index";

dotenv.config();

// const receiver = new SocketModeReceiver({
//   appToken: process.env.SOCKET_TOKEN
// }/*{
//   signingSecret: process.env.SLACK_BOLT_SIGNING_SECRET,
// }*/);
export const app = new App({
  token: process.env.SLACK_BOLT_TOKEN,
  socketMode: true,
  appToken: process.env.SOCKET_TOKEN
  // receiver: receiver,
});
// expressReceiver.app.get("/status", (req, res) => {
//   res.status(200).send();
// });

(async (): Promise<void> => {
  await app.start(/*Number(process.env.PORT) || 3000*/);
  // await receiver.start();
  // await new SocketModeHandler
  console.log("Server started!");

  // credits to Rishi (https://github.com/rishiosaur) for this
  for (const [event, handler] of Object.entries(events)) {
    if(!process.env.CAN_JOIN && event === "ChannelCreate") continue;
    handler(app);
    console.log(`Loaded event: ${event}`);
  }
})();

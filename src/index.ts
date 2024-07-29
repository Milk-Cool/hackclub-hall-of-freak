import * as dotenv from "dotenv";
import { App } from "@slack/bolt";
import * as events from "./events/index";

dotenv.config();

export const app: App = new App({
  token: process.env.SLACK_BOLT_TOKEN,
  signingSecret: process.env.SLACK_BOLT_SIGNING_SECRET,
});

(async (): Promise<void> => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log("Server started!");

  // credits to Rishi (https://github.com/rishiosaur) for this
  for (const [event, handler] of Object.entries(events)) {
    handler(app);
    console.log(`Loaded event: ${event}`);
  }
})();

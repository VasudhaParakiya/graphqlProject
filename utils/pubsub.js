import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const biggerEventEmitter = new EventEmitter();
biggerEventEmitter.setMaxListeners(30);
export default new PubSub({ eventEmitter: biggerEventEmitter });

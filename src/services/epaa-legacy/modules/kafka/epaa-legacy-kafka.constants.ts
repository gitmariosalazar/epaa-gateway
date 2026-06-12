export const EPAA_LEGACY_REPLY_TOPIC = 'epaa_database_legacy_topic.reply';

export const KAFKA_RETRY_OPTIONS = {
  retries: 25,
  initialRetryTime: 1000,
};

export const KAFKA_LEGACY_CONSUMER_OPTIONS = {
  sessionTimeout: 30000,
  heartbeatInterval: 10000,
  rebalanceTimeout: 60000,
  subscribe: { fromBeginning: true },
};

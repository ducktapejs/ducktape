const run: Script = async ({ slack, github }) => {
  console.log('started');
  /*const channel = await slack.getChannel('PRs');
  if (!channel) {
    throw new Error('Channel not found');
  }
  github.hooks.on('pull_request.opened', (info) => {
    slack.api.chat.postMessage({
      channel: channel.id,
      text: `PR ${info.payload.pull_request.title} was opened`,
      mrkdwn: true,
    });
  });*/
};

export default run;
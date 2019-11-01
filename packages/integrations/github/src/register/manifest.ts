const manifest = (codeUrl: string, hookUrl: string) => ({
  name: 'Ducktape',
  url: codeUrl,
  hook_attributes: {
    url: hookUrl,
  },
  redirect_url: `${codeUrl}`,
  default_permissions: {
    issues: 'write',
    checks: 'write',
    statuses: 'write',
    contents: 'read',
    'pull_requests': 'read',
  },
  default_events: [
    'security_advisory',
    'issues',
    'label',
    'issue_comment',
    'check_suite',
    'check_run',
    'status',
    'push',
    'pull_request',
    'pull_request_review',
  ],
});

export default manifest;
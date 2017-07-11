# Hook examples
This page is still work in progress. Feel free to contribute!

## Incoming Github webhook
```json
[
  {
    "id": "webhook",
    "execute-command": "/home/adnan/redeploy-go-webhook.sh",
    "command-working-directory": "/home/adnan/go",
    "pass-arguments-to-command":
    [
      {
        "source": "payload",
        "name": "head_commit.id"
      },
      {
        "source": "payload",
        "name": "pusher.name"
      },
      {
        "source": "payload",
        "name": "pusher.email"
      }
    ],
    "trigger-rule":
    {
      "and":
      [
        {
          "match":
          {
            "type": "payload-hash-sha1",
            "secret": "mysecret",
            "parameter":
            {
              "source": "header",
              "name": "X-Hub-Signature"
            }
          }
        },
        {
          "match":
          {
            "type": "value",
            "value": "refs/heads/master",
            "parameter":
            {
              "source": "payload",
              "name": "ref"
            }
          }
        }
      ]
    }
  }
]
```

## Incoming Bitbucket webhook

Bitbucket does not pass any secrets back to the webhook.  [Per their documentation](https://confluence.atlassian.com/bitbucket/manage-webhooks-735643732.html#Managewebhooks-trigger_webhookTriggeringwebhooks), in order to verify that the webhook came from Bitbucket you must whitelist the IP range `104.192.143.0/24`:

```json
[
  {
    "id": "webhook",
    "execute-command": "/home/adnan/redeploy-go-webhook.sh",
    "command-working-directory": "/home/adnan/go",
    "pass-arguments-to-command":
    [
      {
        "source": "payload",
        "name": "actor.username"
      }
    ],
    "trigger-rule":
    {
      "match":
      {
        "type": "ip-whitelist",
        "ip-range": "104.192.143.0/24"
      }
    }
  }
]
```

## Incoming Gitlab Webhook
Gitlab provides webhooks for many kinds of events. 
Refer to this URL for example request body content: [gitlab-ce/integrations/webhooks](https://gitlab.com/gitlab-org/gitlab-ce/blob/master/doc/user/project/integrations/webhooks.md)
Values in the request body can be accessed in the command or to the match rule by referencing 'payload' as the source:
```json
[
  {
    "id": "redeploy-webhook",
    "execute-command": "/home/adnan/redeploy-go-webhook.sh",
    "command-working-directory": "/home/adnan/go",
    "pass-arguments-to-command":
    [
      {
        "source": "payload",
        "name": "user_name"
      }
    ],
    "response-message": "Executing redeploy script",
    "trigger-rule":
    {
      "match":
      {
        "type": "value",
        "value": "<YOUR-GENERATED-TOKEN>",
        "parameter":
        {
          "source": "header",
          "name": "X-Gitlab-Token"
        }
      }
    }
  }
]
```

## Incoming Gogs webhook
```json
[
  {
    "id": "webhook",
    "execute-command": "/home/adnan/redeploy-go-webhook.sh",
    "command-working-directory": "/home/adnan/go",
    "pass-arguments-to-command":
    [
      {
        "source": "payload",
        "name": "head_commit.id"
      },
      {
        "source": "payload",
        "name": "pusher.name"
      },
      {
        "source": "payload",
        "name": "pusher.email"
      }
    ],
    "trigger-rule":
    {
      "and":
      [
        {
          "match":
          {
            "type": "payload-hash-sha256",
            "secret": "mysecret",
            "parameter":
            {
              "source": "header",
              "name": "X-Gogs-Signature"
            }
          }
        },
        {
          "match":
          {
            "type": "value",
            "value": "refs/heads/master",
            "parameter":
            {
              "source": "payload",
              "name": "ref"
            }
          }
        }
      ]
    }
  }
]
```

## Slack slash command
```json
[
  {
    "id": "redeploy-webhook",
    "execute-command": "/home/adnan/redeploy-go-webhook.sh",
    "command-working-directory": "/home/adnan/go",
    "response-message": "Executing redeploy script",
    "trigger-rule":
    {
      "match":
      {
        "type": "value",
        "value": "<YOUR-GENERATED-TOKEN>",
        "parameter":
        {
          "source": "payload",
          "name": "token"
        }
      }
    }
  }
]
```

## A simple webhook with a secret key in GET query

__Not recommended in production due to low security__

`example.com:9000/hooks/simple-one` - won't work  
`example.com:9000/hooks/simple-one?token=42` - will work

```json
[
  {
    "id": "simple-one",
    "execute-command": "/path/to/command.sh",
    "response-message": "Executing simple webhook...",
    "trigger-rule":
    {
      "match":
      {
        "type": "value",
        "value": "42",
        "parameter":
        {
          "source": "url",
          "name": "token"
        }
      }
    }
  }
]
```

# JIRA Webhooks
[Guide by @perfecto25](https://sites.google.com/site/mrxpalmeiras/notes/jira-webhooks)

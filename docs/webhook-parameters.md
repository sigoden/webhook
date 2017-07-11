# Webhook parameters
```
Usage of webhook:
  --cert string
    	path to the HTTPS certificate pem file (default "cert.pem")
  --header value
    	response header to return, specified in format name=value, use multiple times to set multiple headers (default name=value)
  --hooks value
    	path to the json file containing defined hooks the webhook should serve, use multiple times to load from different files (default hooks.json)
  --hotreload
    	watch hooks file for changes and reload them automatically
  --ip string
    	ip the webhook should serve hooks on (default "0.0.0.0")
  --key string
    	path to the HTTPS certificate private key pem file (default "key.pem")
  --port int
    	port the webhook should serve hooks on (default 9000)
  --secure
    	use HTTPS instead of HTTP
  --urlprefix string
    	url prefix to use for served hooks (protocol://yourserver:port/PREFIX/:hook-id) (default "hooks")
  --verbose
    	show verbose output
  --version
    	display webhook version and quit
```

Use any of the above specified flags to override their default behavior.

# Live reloading hooks
If you are running an OS that supports USR1 signal, you can use it to trigger hooks reload from hooks file, without restarting the webhook instance.
```bash
kill -USR1 webhook-pid
```

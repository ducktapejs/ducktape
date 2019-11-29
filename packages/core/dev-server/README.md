
# Ducktape Dev Server

Creates an ngrok tunnel and runs an npm command, which gets restartet on `.js` and `.ts` file changes

## Usage

`ducktape-dev-server <your-command>`

Runs `npm <your-command>` and loads environment variabled from `.env`


**Environment variables**

* **NGROK_AUTH_TOKEN**: Your ngrok aut token
* **NGROK_SUBDOMAIN**: The ngrok subdomain to use
* **NGROK_REGION**: The ngrok domain to use
* **PORT**: The port to start the server on
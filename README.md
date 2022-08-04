
# NFT Wallet-Verify Setup Docs

  * Features
    * Verify on OpenSea and Looksrare using bio
    * Multiple Server Support
    * Fully OpenSource
    * Easily Customizable

## Bot Setup
#### 1. Creating the bot

Follow this guide Step 1 through 7: https://discordpy.readthedocs.io/en/stable/discord.html

#### 2. Download the code and extract it
Download the code from the Github and Extract it and move it to the main directory on your PC.

#### 3. Generate API Keys
You need API keys for both Module which you can generate it here: https://dash.modulenft.xyz/ and Reservoir: https://docs.reservoir.tools/reference/postapikeys

#### 4. Install NodeJS and NPM
I recommend following this: https://phoenixnap.com/kb/install-node-js-npm-on-windows

#### 5. Setting up the Config Files
* __config-example.json__
```json

  {
    "token": "",
    "moduleAPIKey": "",
    "reservoirAPIKey": ""
  }

```
Enter your Discord Token in the Token Field
Enter your ModuleAPIKey in the moduleAPIKey Field
Enter your Reservoir API key in the ReservoirAPIKey Field

##### Next Save it and rename the file to config.json

#### 6. Starting the bot
Next copy the path of the bot in your file explorer and open Command Prompt
Once you get into Command Prompt type in cd and then right click to paste in the path and click enter
Next, you will need to run `npm install`
After that completes run `node .` to start the bot

#### 7. Server Config
Once the bot is in your server and online you can use `/addcontract` to add the contract and set the verification role

### and BOOM! Your Done! Enjoy the Wallet Verify bot by Goodin

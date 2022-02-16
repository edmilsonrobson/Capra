# Ferret-San

Ferret-San is a script that aids in the quality control of intercom conversations.

When executed, it will sample conversations from a few admins based on certain criteria.

## How to Run

This script has been tested with node version `v12.16.1`. You can check your node version by running `node -v` in your terminal.

1. Clone this repository or download it clicking [here](https://github.com/edmilsonrobson/Ferretsan/archive/refs/heads/main.zip) and unzipping it.
1. Inside Ferret-San's folder, make a copy of the `.env.example` file and name it `.env`.
1. Fill the `INTERCOM_ACCESS_TOKEN=` value with your Intercom access token. For example, `INTERCOM_ACCESS_TOKEN=G9rOmFmNGI2YzMyXzM2dASduNWD31SAD13M=`. You can get it by clicking [here](https://app.intercom.com/a/apps/qzw05t6c/developer-hub/app-packages/78564/oauth), under "Access token".
1. Navigate to this repository's folder via the terminal and run `npm install`.
1. Check the `config.json` file to configure the script to your liking.
1. Run `npm run start` to run the script.

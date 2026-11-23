# Trailhead — BTC race bot

A buy-and-hold-with-a-parachute bot for the BTC 24h race: buys the full $1,000 on the first bar and sells everything the first time a close prints 2% below the highest close of the last 60 bars, then stays flat. No re-entry, no noise-chasing.

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/vjmunggahari-ui/btc-race-24h-20261123-0511-ono10/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/vjmunggahari-ui/btc-race-24h-20261123-0511-ono10/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

## Run it

Grade the bot on the dev window (from inside the unpacked kit directory):

```
node cli/makefun.mjs grade-local --kit . --bot <path-to-this-repo> --driver process
```

Dev result: net PnL +$32.17, max drawdown 1.98%, 1 trade (buy-and-hold parity on the up-trending dev window, with a 2% trailing-stop parachute for a down day).

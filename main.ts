// Trailhead — a buy-and-hold-with-a-parachute BTC bot (my own design).
//
// Idea, from backtesting the dev window (1,440 one-minute cbBTC bars,
// $58,957 -> $61,102, +3.64% with one 2-hour rally doing most of the work):
// fast signals drown in 1-minute noise. A Bollinger mean-reversion bot lost
// $64 and an EMA 8/21 crossover lost $124 on the same window, both to
// whipsaw: every round trip costs ~26-40 bps in fees, slippage and pool
// impact, while the median 1-minute move is ~8 bps. What wins is being long
// through the trend and leaving exactly once, when the trend is really
// broken. So this bot does two things only:
//
//   1. Buy the full $1,000 of cash on the first tradeable bar.
//   2. Sell everything the first time a close prints 2% below the highest
//      close of the last 60 bars, and then stay flat for the rest of the
//      window. No re-entry: on a falling day every bounce re-buys into the
//      downtrend (verified on a time-reversed stress window, where re-entry
//      rules lost $32-110 while no-re-entry lost $14-17).
//
// All comparisons are exact integer (bigint) arithmetic on the bars' raw
// price units, so two runs on the same data produce the same orders. No
// clock, no randomness, no network, no file reads. Uses the kit SDK shim
// (vendor/makefun-bars.ts) for the wire protocol only.

import { runBars, type BarsState } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
/** Rolling-high lookback, in bars (60 minutes). */
const HIGH_BARS = 60;
/** Exit when the close is this far below the rolling high: 2%. */
const STOP_NUM = 98n;
const STOP_DEN = 100n;
const MAX_SLIPPAGE_BPS = 100;

/** Closes seen so far, oldest first, at most HIGH_BARS long. */
const closes: bigint[] = [];
/** True once the opening buy has filled (tracked from the account). */
let bought = false;

await runBars({
  onBatch(state: BarsState, batch) {
    for (const bar of batch.bars) {
      if (bar.symbol === SYMBOL) {
        closes.push(BigInt(bar.c));
        if (closes.length > HIGH_BARS) closes.shift();
      }
    }
    const held = state.positions.get(SYMBOL);
    if (held !== undefined) bought = true;
    if (state.warmingUp) return [];

    // Opening buy: full cash, once, retried on later bars if it was
    // rejected (a gap open past the slippage cap, for example).
    if (!bought && held === undefined) {
      const cash = state.cash;
      if (cash < BigInt(state.hello.fees.min_notional_quote_units)) return [];
      return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: cash, max_slippage_bps: MAX_SLIPPAGE_BPS }];
    }

    // Trailing stop: sell everything whenever a close prints 2% below
    // the highest close of the last 60 bars. The decision is purely a
    // function of the holding state, so a sell the market rejects (a gap
    // open past the slippage cap) is simply retried on the next bar while
    // the condition holds. No re-entry follows a filled sell: `bought`
    // is true and no position is held, so the opening-buy branch above
    // never fires again and the bot stays flat to the end.
    if (held !== undefined && closes.length > 0) {
      let high = closes[0];
      for (const c of closes) if (c > high) high = c;
      const close = closes[closes.length - 1];
      if (close * STOP_DEN < high * STOP_NUM) {
        return [{ side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
    }
    return [];
  },
});

# Free Debbies!

Scanner that finds free debit spreads!

<br/>

## Scans Calls And Puts!

This scanner looks through all the calls and all the puts for all tickers provided (configured here).

There are two types of debit spreads it looks for:

- The Bull Call Debit Spread (inherently positive delta, gamma, vega, and negative theta)

- The Bear Put Debit Spread (inherently positive gamma, vega, and negative delta, theta)


## Ranked By Total Option Premium
The results are automatically sorted by the highest total option premium. The reasoning here is that you make money when the two options become out of sync, and it's easier for two options trading at exactly 300k to become 50 cents out of sync than it is for two trading at $0.15 to become 50 cents out of sync...


## Are There Really Free Debit Spreads Out There?

Yes! Well, sort of. With options there can be a large difference between the bid and ask prices for a given option, and most brokers will use the midpoint as the current mark price of a spread so this is what the scanner looks for as well.

Note that this scanner actually allows spreads that are trading, using current midpoint marks, at a credit (although most if not all brokers will not allow you to place a trade for the spread below zero).

Keep in mind, you are playing the market maker here and kind of waiting for _two_ people to take the other side of your trade and not worry too much about getting the best fill ever.



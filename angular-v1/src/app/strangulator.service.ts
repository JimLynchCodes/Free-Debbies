import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StrangulatorService {

  constructor() { }

  analyzePutSpreads(ticker: string, putExpirationMap: any, underlyingData: any) {

    console.log('undy', underlyingData)
    console.log('undy last', underlyingData.last)
    console.table('undy', underlyingData)

    console.log('analyzing spreads for: ', ticker, putExpirationMap);

    const gudOnes = [];

    // loop through expiration tables
    Object.entries(putExpirationMap).forEach(([expirationString, puts]) => {

      console.log(ticker + 'expirationString: ', expirationString);
      console.log(ticker + ' puts: ', puts);

      // loop through strikes for a given expiration cycle
      // Object.entries(puts).forEach( ([strike, put], entryIndex) => {

      //   console.log(ticker + 'strike: ', strike);
      //   console.log(ticker + ' put: ', put);

      //   if (puts)

      // })

      const strikes = Object.keys(puts)

      for (var i = 0; i < strikes.length; i++) {

        const strike = strikes[i];

        // console.log(ticker + ' strike: ', strike);
        console.log(ticker + ' put: ', puts[strike]);
        // console.log(ticker + ' next put: ', strikes[i + 1])

        if (strikes[i + 1]) {

          const lowerStrike = puts[strikes[i]][0].strikePrice;
          // long put (lower strike)

          // console.log(ticker + ' -- lower strike: ' + lowerStrike)
          // console.log(ticker + ' -- lower strike theta: ' + puts[strikes[i]][0].theta)

          const lowerStrikePutBid = puts[strikes[i]][0].bid

          const lowerStrikePutBidAskMidpoint = (puts[strikes[i]][0].ask + lowerStrikePutBid) / 2

          // console.log(ticker + ' -- higher strike bid: ' + puts[strikes[i]][0].bid)
          // console.log(ticker + ' -- higher strike ask' + puts[strikes[i]][0].ask)
          // console.log(ticker + ' -- higher strike bid/ask midpoint: ' + higherStrikePutBidAskMidpoint)

          const higherStrike = puts[strikes[i + 1]][0].strikePrice;
          const higherStrikePutBid = puts[strikes[i + 1]][0].bid;
          // short put (higher strike)

          // console.log(ticker + ' -- higher strike: ' + higherStrike)
          // console.log(ticker + ' -- higher strike theta: ' + puts[strikes[i + 1]][0].theta)

          const higherStrikePutBidAskMidpoint = (puts[strikes[i + 1]][0].ask + higherStrikePutBid) / 2

          // console.log(ticker + ' -- lower strike bid: ' + puts[strikes[i + 1]][0].bid)
          // console.log(ticker + ' -- lower strike ask' + puts[strikes[i + 1]][0].ask)
          // console.log(ticker + ' -- lower strike bid/ask midpoint: ' + lowerStrikePutBidAskMidpoint)

          const netTheta = (puts[strikes[i]][0].theta - puts[strikes[i + 1]][0].theta);
          // console.log(ticker + ' ----- net theta: ' + netTheta);

          const netDelta = (puts[strikes[i]][0].delta - puts[strikes[i + 1]][0].delta);
          // console.log(ticker + ' ----- net delta: ' + netDelta);

          const netCreditForSpread = higherStrikePutBidAskMidpoint - lowerStrikePutBidAskMidpoint

          // console.log(ticker + ' ----- net credit: ' + netCreditForSpread);

          const strikeWidth = puts[strikes[i + 1]][0].strikePrice - puts[strikes[i]][0].strikePrice

          // console.log(ticker + ' ----- strikeWidth: ' + strikeWidth);

          const maxLoss = strikeWidth - netCreditForSpread

          // console.log(ticker + ' ----- max loss for spread: ' + maxLoss);

          const tomlScore = netTheta / maxLoss;

          // console.log(ticker + ' ----- toml score: ' + tomlScore);

          // only positive theta, no debit spreads
          if (netTheta > 0 && netCreditForSpread > 0 && tomlScore < Infinity) {

            // don't go for options with zero bidders!
            if (lowerStrikePutBid > 0 && higherStrikePutBid > 0) {

              // only OTM puts...
              if (higherStrike < underlyingData.last) {

                const fortnightAway = new Date(Date.now() + 1.21e9);

                const expirationDate = new Date(puts[strike][0].expirationDate);


                console.log('time exp: ', puts[strike][0].expirationDate);
                console.log('time 2: ', fortnightAway);
                console.log('time: ', expirationDate);
                
                if (expirationDate > fortnightAway) {

                  gudOnes.push({
                    ticker,
                    underlyingPrice: underlyingData.last,
                    higherStrike,
                    lowerStrike,
                    higherStrikePutBidAskMidpoint,
                    lowerStrikePutBidAskMidpoint,
                    expirationCycle: expirationString,
                    netTheta,
                    netDelta,
                    netCreditForSpread,
                    maxLoss,
                    tomlScore
                  })
                }
              }
            }
          }
        }
      }
    })

    const gudOnesSorted = gudOnes.sort((a, b) => a.tomlScore > b.tomlScore ? -1 : 1)

    console.log(gudOnesSorted.length)
    console.log('done calculating spreads!')

    return gudOnesSorted.slice(0, 25);

  }

  private hasNanGreeks(currentCallOrPut) {

    // console.log('checking option\'s greeks: ', currentCallOrPut)

    if (
      !currentCallOrPut.theta ||
      !currentCallOrPut.delta ||
      !currentCallOrPut.gamma ||
      currentCallOrPut.delta == 'N/A' ||
      currentCallOrPut.delta == 'n/a' ||
      currentCallOrPut.delta == 'Nan' ||
      currentCallOrPut.delta == 'NaN' ||
      currentCallOrPut.gamma == 'N/A' ||
      currentCallOrPut.gamma == 'n/a' ||
      currentCallOrPut.gamma == 'Nan' ||
      currentCallOrPut.gamma == 'NaN' ||
      currentCallOrPut.theta == 'N/A' ||
      currentCallOrPut.theta == 'n/a' ||
      currentCallOrPut.theta == 'Nan' ||
      currentCallOrPut.theta == 'NaN'
    ) {

      // console.log('the greeks are NaN!')
      return true;
    }

    return false;
  }

}

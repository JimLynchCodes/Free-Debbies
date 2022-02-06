import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StrangulatorService {

  getPennyCallSpreads(symbol: any, callExpDateMap: any, underlyingData: any) {

    console.log('getting penny call spreads for: ', symbol, callExpDateMap);

    const gudOnes = [];

    // loop through expiration tables
    Object.entries(callExpDateMap).forEach(([expirationString, calls]) => {

      console.log('now looking at: ' + symbol + 'expirationString: ', expirationString);

      // loop through strikes for a given expiration
      const strikes = Object.keys(calls)

      for (var i = 0; i < strikes.length; i++) {

        const strike = strikes[i];

        // console.log(ticker + ' strike: ', strike);
        // console.log(ticker + ' put: ', puts[strike]);

        if (strikes[i + 1]) {

          const lowerStrike = calls[strikes[i]][0].strikePrice;
          const higherStrike = calls[strikes[i + 1]][0].strikePrice;

          console.log('#$# comparing strike ' + lowerStrike + ' to next higher: ' + higherStrike)

          const lowerStrikeBid = calls[strikes[i]][0].bid
          const lowerStrikeAsk = calls[strikes[i]][0].ask;
          const lowerStrikeMidpoint = (lowerStrikeAsk + lowerStrikeBid) / 2;

          console.log('#$# (strike ' + calls[strikes[i]][0].strikePrice + '), bid: ' + lowerStrikeBid + ', ask: ' + lowerStrikeAsk, ', mid: ', lowerStrikeMidpoint)

          const higherStrikeBid = calls[strikes[i + 1]][0].bid
          const higherStrikeAsk = calls[strikes[i + 1]][0].ask;
          const higherStrikeMidpoint = (higherStrikeAsk + higherStrikeBid) / 2;

          console.log('#$# (strike ' + calls[strikes[i + 1]][0].strikePrice + '), bid: ' + higherStrikeBid + ', ask: ' + higherStrikeAsk, ', mid: ', higherStrikeMidpoint)

          const midpointDifference = lowerStrikeMidpoint - higherStrikeMidpoint;

          console.log('#$# debit difference: ', midpointDifference);

          // if (midpointDifference < 0.05 && midpointDifference > -0.05) {
          if (midpointDifference < 0.05) {
            console.log('#$# WOAHHHHH!!! ', midpointDifference);

            if (higherStrikeBid < 0.05 || lowerStrikeBid < 0.05) {
              console.log('#$# Ahhhh, false alarm...')
            }
            else {

              const gudOne = {
                symbol,
                spreadType: 'CALLS',
                totalPremiumSum: higherStrikeMidpoint + lowerStrikeMidpoint,
                higherStrike,
                lowerStrike,
                underlyingPrice: underlyingData.last,
                higherStrikeMidpoint,
                lowerStrikeMidpoint,
                expirationCycle: expirationString,
                midpointDifference,
              }

              console.log('#$# Gucci? ', gudOne)

              gudOnes.push(gudOne)
            }
          }

        }
        else {
          console.log('#$# on last strike (no next higher one): ', strikes[i]);
        }

      }

    })

    const gudOnesSorted = gudOnes.sort((a, b) => a.totalPremiumSum > b.totalPremiumSum ? -1 : 1)

    console.log(gudOnesSorted.length)
    console.log('done calculating spreads!')

    // return gudOnesSorted.slice(0, 25);
    return gudOnesSorted;

  }


  getPennyPutSpreads(symbol: any, putExpDateMap: any, underlyingData: any) {

    console.log('getting penny put spreads for: ', symbol, putExpDateMap);

    const gudOnes = [];

    // loop through expiration tables
    Object.entries(putExpDateMap).forEach(([expirationString, puts]) => {

      console.log('now looking at: ' + symbol + 'expirationString: ', expirationString);

      // loop through strikes for a given expiration
      const strikes = Object.keys(puts)

      for (var i = 0; i < strikes.length; i++) {

        const strike = strikes[i];

        // console.log(ticker + ' strike: ', strike);
        // console.log(ticker + ' put: ', puts[strike]);

        if (strikes[i + 1]) {

          const lowerStrike = puts[strikes[i]][0].strikePrice;
          const higherStrike = puts[strikes[i + 1]][0].strikePrice;

          console.log('#$# comparing strike ' + lowerStrike + ' to next higher: ' + higherStrike)

          const lowerStrikeBid = puts[strikes[i]][0].bid
          const lowerStrikeAsk = puts[strikes[i]][0].ask;
          const lowerStrikeMidpoint = (lowerStrikeAsk + lowerStrikeBid) / 2;

          console.log('#$# (strike ' + puts[strikes[i]][0].strikePrice + '), bid: ' + lowerStrikeBid + ', ask: ' + lowerStrikeAsk, ', mid: ', lowerStrikeMidpoint)

          const higherStrikeBid = puts[strikes[i + 1]][0].bid
          const higherStrikeAsk = puts[strikes[i + 1]][0].ask;
          const higherStrikeMidpoint = (higherStrikeAsk + higherStrikeBid) / 2;

          console.log('#$# (strike ' + puts[strikes[i + 1]][0].strikePrice + '), bid: ' + higherStrikeBid + ', ask: ' + higherStrikeAsk, ', mid: ', higherStrikeMidpoint)

          const midpointDifference = higherStrikeMidpoint - lowerStrikeMidpoint;

          console.log('#$# debit difference: ', midpointDifference);

          // if (midpointDifference < 0.05 && midpointDifference > -0.05) {
          if (midpointDifference < 0.05) {
            console.log('#$# WOAHHHHH!!! ', midpointDifference);

            if (higherStrikeBid < 0.05 || lowerStrikeBid < 0.05) {
              console.log('#$# Ahhhh, false alarm...')
            }
            else {

              const gudOne = {
                symbol,
                spreadType: 'PUTS',
                totalPremiumSum: higherStrikeMidpoint + lowerStrikeMidpoint,
                higherStrike,
                lowerStrike,
                underlyingPrice: underlyingData.last,
                higherStrikeMidpoint,
                lowerStrikeMidpoint,
                expirationCycle: expirationString,
                midpointDifference,
              }

              console.log('#$# Gucci? ', gudOne)

              gudOnes.push(gudOne)
            }
          }

        }
        else {
          console.log('#$# on last strike (no next higher one): ', strikes[i]);
        }

      }

    })

    const gudOnesSorted = gudOnes.sort((a, b) => a.totalPremiumSum > b.totalPremiumSum ? -1 : 1)

    console.log(gudOnesSorted.length)
    console.log('done calculating spreads!')

    // return gudOnesSorted.slice(0, 25);
    return gudOnesSorted;

  }

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
                    spreadType: 'CALLS',
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

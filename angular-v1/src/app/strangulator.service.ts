import { Injectable } from '@angular/core';

const MAXIMUM_DEBIT_PRICE = 0.15;

const MINIMUM_ACCEPTABLE_BID = 0.85;

@Injectable({
  providedIn: 'root'
})
export class StrangulatorService {

  getPennyCallSpreads(symbol: any, callExpDateMap: any, underlyingData: any) {

    const gudOnes = [];

    // loop through expiration tables
    Object.entries(callExpDateMap).forEach(([expirationString, calls]) => {

      // loop through strikes for a given expiration
      const strikes = Object.keys(calls)

      for (var i = 0; i < strikes.length; i++) {

        const strike = strikes[i];

        if (strikes[i + 1]) {

          const lowerStrike = calls[strikes[i]][0].strikePrice;
          const higherStrike = calls[strikes[i + 1]][0].strikePrice;

          const lowerStrikeBid = calls[strikes[i]][0].bid
          const lowerStrikeAsk = calls[strikes[i]][0].ask;
          const lowerStrikeMidpoint = (lowerStrikeAsk + lowerStrikeBid) / 2;

          const higherStrikeBid = calls[strikes[i + 1]][0].bid
          const higherStrikeAsk = calls[strikes[i + 1]][0].ask;
          const higherStrikeMidpoint = (higherStrikeAsk + higherStrikeBid) / 2;

          const midpointDifference = lowerStrikeMidpoint - higherStrikeMidpoint;

          const expirationDate = expirationString.substr(0, +expirationString.indexOf(':'))
          const expirationDaysLeft = expirationString.substr(expirationString.indexOf(':') + 1)

          if (midpointDifference < MAXIMUM_DEBIT_PRICE) {

            if (higherStrikeBid < MINIMUM_ACCEPTABLE_BID || lowerStrikeBid < MINIMUM_ACCEPTABLE_BID) {
              console.log('Ahhhh, false alarm...')
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
                expirationDate: expirationDate,
                expirationDaysLeft: expirationDaysLeft,
                midpointDifference,
              }

              gudOnes.push(gudOne)
            }
          }

        }
        else {
          // OK
        }

      }

    })

    const gudOnesSorted = gudOnes.sort((a, b) => a.totalPremiumSum > b.totalPremiumSum ? -1 : 1)

    return gudOnesSorted;
  }


  getPennyPutSpreads(symbol: any, putExpDateMap: any, underlyingData: any) {

    const gudOnes = [];

    // loop through expiration tables
    Object.entries(putExpDateMap).forEach(([expirationString, puts]) => {

      // loop through strikes for a given expiration
      const strikes = Object.keys(puts)

      for (var i = 0; i < strikes.length; i++) {

        const strike = strikes[i];

        if (strikes[i + 1]) {

          const lowerStrike = puts[strikes[i]][0].strikePrice;
          const higherStrike = puts[strikes[i + 1]][0].strikePrice;

          const lowerStrikeBid = puts[strikes[i]][0].bid
          const lowerStrikeAsk = puts[strikes[i]][0].ask;
          const lowerStrikeMidpoint = (lowerStrikeAsk + lowerStrikeBid) / 2;

          const higherStrikeBid = puts[strikes[i + 1]][0].bid
          const higherStrikeAsk = puts[strikes[i + 1]][0].ask;
          const higherStrikeMidpoint = (higherStrikeAsk + higherStrikeBid) / 2;

          const midpointDifference = higherStrikeMidpoint - lowerStrikeMidpoint;

          const expirationDate = expirationString.substr(0, +expirationString.indexOf(':'))
          const expirationDaysLeft = expirationString.substr(expirationString.indexOf(':') + 1)

          if (midpointDifference < MAXIMUM_DEBIT_PRICE) {

            if (higherStrikeBid < MINIMUM_ACCEPTABLE_BID || lowerStrikeBid < MINIMUM_ACCEPTABLE_BID) {
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
                expirationDate: expirationDate,
                expirationDaysLeft: expirationDaysLeft,
                midpointDifference,
              }

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

    return gudOnesSorted;

  }

}

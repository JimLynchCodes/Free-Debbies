
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TdApiService, BuyOrSell } from '../../services/td-api/td-api.service';
import { ToastManagerService } from '../../services/toast-manager/toast-manager.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EnableGainslockerModalService } from '../../components/modals/enable-gainslock-confirm/enable-gainslock-modal.service';
import { AskCancelOrderModalService } from '../../components/modals/ask-cancel-order/ask-cancel-order-modal.service';
import { AskPlaceTradeModalService } from 'src/app/components/modals/ask-place-trade/ask-place-trade-modal.service';
import { interval } from 'rxjs';
import { decideLimitPrice } from 'src/app/services/limit-price-decider';
import { decideBuyOrSell } from 'src/app/services/buy-or-sell-decider';
import { StrangulatorService } from 'src/app/strangulator.service';

const fakeBuyOrder1 = {
  quantity: 1,
  price: 2,
  orderLegCollection: [{
    instruction: 'BUY',
    instrument: {
      symbol: 'MSFT'
    }
  }],
  reasons: [{
    text: 'spike up in volume',
  },
  {
    text: 'just picked up a great new CTO'
  },
  {
    text: 'price has been steadily climbing'
  },
  {
    text: 'triple gainers list 10/14/2020 with 80% buy recc'
  }]

}

const fakeBuyOrder2 = {
  quantity: 2,
  price: 3.45,
  orderLegCollection: [{
    instruction: 'BUY',
    instrument: {
      symbol: 'AAPL'
    }
  }],
  reasons: [{
    text: 'spike up in volume',
  },
  {
    text: 'just picked up a great new CTO'
  },
  {
    text: 'price has been steadily climbing'
  },
  {
    text: 'triple gainers list 10/14/2020 with 80% buy recc'
  }
  ]

}

const fakeBuyOrder3 = {
  quantity: 1,
  price: 265.23,
  orderLegCollection: [{
    instruction: 'BUY',
    instrument: {
      symbol: 'TSLA'
    }
  }],
  reasons: [{
    text: 'spike up in volume',
  },
  {
    text: 'just picked up a great new CTO'
  },
  {
    text: 'price has been steadily climbing'
  },
  {
    text: 'triple gainers list 10/14/2020 with 80% buy recc'
  }
  ]

}

const fakeSellOrder1 = {
  quantity: 1,
  price: 1000,
  orderLegCollection: [{
    instruction: 'SELL',
    instrument: {
      symbol: 'TSLA'
    }
  }]
}

@Component({
  selector: 'app-trade-bot-page',
  templateUrl: './trade-bot-page.component.html',
  styleUrls: ['./trade-bot-page.component.scss'],
})
export class TradeBotPageComponent {

  accountNumber: string;

  accountsData: any;

  // largecapTickers = ['TSM', 'TSLA', 'BABA', 'WMT', 'DIS', 'BAC', 'NVDA', 'PYPL', 'INTC', 'NFLX']
  largecapTickers = []
  // etfTickers = ['IWM', 'QQQ', 'EEM', 'EWZ', 'IWM', 'XLF', 'SQQQ', 'SLV', 'GDX', 'XLE']
  // etfTickers = ['SPY', 'QQQ', 'SOXL']
  etfTickers = []
  // memeStonkTickers = ['GME', 'AMC', 'MVIS', 'VIAC', 'RKT', 'AMD', 'MSFT', 'PLTR', 'TLRY', 'NIO', 'UBER', 'APHA', 'EBAY', 'MDB']
  // solidProfitMakersTickers = ['MELI', 'APPL', 'AMZN', 'FB', 'COST', 'EW', 'BAND', 'SPOT', 'MAXR', 'LW', 'HD', 'MARA', 'BITO']
  solidProfitMakersTickers = []
  // memeStonkTickers = ['GME', 'AMC', 'MVIS', 'VIAC', 'RKT', 'AMD', 'MSFT', 'PLTR', 'TLRY', 'NIO', 'UBER', 'APHA', 'EBAY', 'MDB', 'NFLX', 'TSLA', 'NVDA', 'DIS', 'SNAP', 'COST', 'SBUX', 'UNH', 'CVS', 'UPS', 'SHW']
  // memeStonkTickers = ['GME', 'MDB']
  // memeStonkTickers = ['COF', 'SNAP']
  // memeStonkTickers = ['AMZN', 'GOOGL', 'TSLA', 'LYFT', 'SAVE']
  memeStonkTickers = ['AMZN', 'GOOGL', 'TSLA', 'HOG', 'PFE', 'PTON', 'TWLO', 'APPS', 'CRSR', 'CHGG', 'SPX', 'IWM', 'SMH', 'DDOG', 'NET', 'MGM', 'GLBE', 'CMG', 'SEB', 'BKNG']
  // bestInClassTickers = ['GOOG', 'GOOGL', 'APPL', 'AMZN', 'FB', 'COST']
  bestInClassTickers = []

  rowsInTickerTable = 0
  arrayOfRowIndicies = []

  allSymbols = []

  // strangulations = [];
  analyzedSpreads = [];
  analyzedDebitSpreads = [];

  constructor(private http: HttpClient,
    private tdApiSvc: TdApiService,
    private strangulator: StrangulatorService,
  ) { }

  access_token = ''

  gotTdData = false

  async ngOnInit() {

    setTimeout(() => {

      console.log('ok....')

      this.analyzedDebitSpreads = this.analyzedDebitSpreads.sort((a, b) => {
        console.log('#$# OR' + a.totalPremiumSum)

        return a.totalPremiumSum > b.totalPremiumSum ? -1 : 1
      })

      console.log('#$# sorted ', this.analyzedDebitSpreads)

      console.log('#$# pushed ',  this.analyzedDebitSpreads)
    }, 20_000)

    this.allSymbols = [
      ...this.largecapTickers,
      ...this.etfTickers,
      ...this.memeStonkTickers,
      ...this.solidProfitMakersTickers
    ]

    this.rowsInTickerTable = Math.max(
      this.largecapTickers.length,
      this.etfTickers.length,
      this.memeStonkTickers.length,
      this.solidProfitMakersTickers.length
    );

    this.arrayOfRowIndicies = Array.from(Array(this.rowsInTickerTable).keys())

    if (!this.accountsData) {

      // this.accountsData = await this.tdApiSvc.getPositions();

      console.log('#$# looping over tickers: ', this.allSymbols)

      this.analyzedDebitSpreads = []

      this.allSymbols.forEach(async symbol => {

        console.log('#$# calling for chain: ', symbol);

        let optionChain: any

        try {
          optionChain = await this.tdApiSvc.getOptionChainForSymbol(symbol);
        }
        catch (err) {
          console.log('#$# couldn\'t get options chains for: ', symbol)
        }

        // const minAcceptableDelta = -0.002
        // const maxAcceptableDelta = 0.002

        // const minAcceptableGamma = -0.01
        // const maxAcceptableGamma = 0.01

        // console.log('chain for ' + symbol + ': ', optionChain)

        if (optionChain['underlying']) {

          console.log('#$# analyzing spreads for ', symbol, optionChain.putExpDateMap, optionChain.underlying)

          const spreadsForTicker = this.strangulator.analyzePutSpreads(symbol, optionChain.putExpDateMap, optionChain.underlying)

          const callSpreads = this.strangulator.getPennyCallSpreads(symbol, optionChain.callExpDateMap, optionChain.underlying)
          const putSpreads = this.strangulator.getPennyPutSpreads(symbol, optionChain.putExpDateMap, optionChain.underlying)

          console.log('#$# call spreads ------')
          console.log('#$#', callSpreads)

          // const strangulation = this.strangulator.strangulate(
          //   optionChain['callExpDateMap'],
          //   optionChain['putExpDateMap'],
          //   optionChain['underlying']['last'],
          //   minAcceptableDelta,
          //   maxAcceptableDelta,
          //   minAcceptableGamma,
          //   maxAcceptableGamma
          // )

          this.analyzedDebitSpreads.push(...callSpreads)
          this.analyzedDebitSpreads.push(...putSpreads)

          // this.analyzedSpreads.push(spreadsForTicker);
         

          // this.strangulations = this.strangulations.filter(strangulation => {
          //   return strangulation.length > 0
          // })

          // this.strangulations = this.strangulations.sort((a, b) => {
          //   return a[0].thetaPower > b[0].thetaPower ? 1 : -1
          // })

          // console.log('the gud ones are..... ', this.strangulations);



        }

      })






    }
  }
}

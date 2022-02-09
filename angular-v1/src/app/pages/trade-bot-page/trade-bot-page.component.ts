
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TdApiService } from '../../services/td-api/td-api.service';
import { StrangulatorService } from 'src/app/strangulator.service';

@Component({
  selector: 'app-trade-bot-page',
  templateUrl: './trade-bot-page.component.html',
  styleUrls: ['./trade-bot-page.component.scss'],
})
export class TradeBotPageComponent {

  accountNumber: string;

  accountsData: any;

  // largecapTickers = ['GOOG', 'GOOGL', 'AAPL', 'MSFT', 'TSM', 'TSLA', 'BABA', 'WMT', 'DIS', 'BAC', 'NVDA', 'AMZN', 'SEB', 'CMG', 'AMD', 'FB', 'AMZN', 'TSLA', 'SOXL', ]
  
  // wall street jesus scans
  // largecapTickers = []
  largecapTickers = ['FB', 'GOOGL', 'TSLA']
  // etfTickers = ['IWM', 'QQQ', 'EEM', 'EWZ', 'IWM', 'XLF', 'SQQQ', 'SLV', 'GDX', 'XLE', 'TQQQ', 'SOXL', 'SMH', 'SPY', 'SPX']
  etfTickers = ['SPX'] 
  // growthStockTickers = ['HOG', 'PTON', 'TWLO', 'APPS', 'CRSR', 'CHGG', 'DDOG', 'NET', 'MGM', 'GLBE', 'AMGN', 'CHGG', 'SNAP', 'NIO', 'COIN', 'CVS', 'REGN', 'U', 'F', 'SPOT', 'ZNGA', 'BP', 'TTWO', 'JD', 'MA', 'UBER', 'DWAC', 'PTON', 'GME', 'SNAP', 'OIL', 'LYFT', 'PACE', 'PYPL', 'LINK', 'GLD', 'NET', 'SLV', 'DIS', 'SPOT', 'NFLX', 'SAND', 'LEN']
  // growthStockTickers = ['SPY', 'SPX', 'APPS', 'TQQQ', 'SOXL', 'NIO', 'U', 'TSLA', 'RTX', 'CCJ', 'YETI', 'AMD', 'AMC', 'VFF', 'FRSH', 'MCRI', 'SQ', 'HBI']
  
  // long term shorts (furnaces)
  growthStockTickers = ['HBI', 'VNCE', 'XELB', 'REED', 'WTER', 'BRFH', 'PBYI', 'MDWD', 'HIMS', 'SUMR', 'BGI', 'MYTE', 'NETI', 'NAT', 'INSW', 'PXS', 'TOPS', 'PSHG', 'AIT', 'SGBX', 'ALPP', 'CRS', 'MEDS', 'GNLN', 'RAD', 'IDW', 'GCI', 'DALN', 'MLCO', 'LVS', 'MSC', 'PLYS', 'CZR', 'HGV', 'VAC', 'SMIT', 'SLNH', 'WRAP', 'NXTD', 'ARLO', 'ADT', 'EMAN', 'CCMP', 'LEDS', 'FST', 'KORE', 'BMTX', 'TEAM', 'ASAN', 'RNG', 'PRO', 'MSTR', 'QUMU', 'SNCR', 'BKNG', 'COF', 'OXY', 'SKLZ', 'NOVA', 'BLNK', 'LMND', 'PLUG', 'TUP', 'K', 'KMX', 'AXP', 'LQD', 'BBWI' ]
  // growthStockTickers = []

  rowsInTickerTable = 0
  arrayOfRowIndicies = []

  allSymbols = []
  analyzedSpreads = [];
  analyzedDebitSpreads = [];

  constructor(private http: HttpClient,
    private tdApiSvc: TdApiService,
    private strangulator: StrangulatorService,
  ) { }

  access_token = ''

  gotTdData = false

  async ngOnInit() {

    // setTimeout(() => {

    //   this.analyzedDebitSpreads = this.analyzedDebitSpreads.sort((a, b) => {
    //     return a.totalPremiumSum > b.totalPremiumSum ? -1 : 1
    //   })

    //   console.log('#$# sorted ', this.analyzedDebitSpreads)

    // }, 20_000)

    this.allSymbols = [
      ...this.largecapTickers,
      ...this.etfTickers,
      ...this.growthStockTickers
    ]

    this.rowsInTickerTable = Math.max(
      this.largecapTickers.length,
      this.etfTickers.length,
      this.growthStockTickers.length
    );

    await this.tdApiSvc.init();

    this.arrayOfRowIndicies = Array.from(Array(this.rowsInTickerTable).keys())

    console.log('#$# looping over tickers: ', this.allSymbols);

    await this.recalcSpreads();

  }

  async placeFreeDebbieOrder(debbieData) {

    console.log('debbie data: ', debbieData)

    const fakeAccount = '756614296'

    await this.tdApiSvc.placeFreeDebbieOrder(debbieData.symbol, debbieData.spreadType, debbieData.higherStrike, debbieData.lowerStrike, debbieData.expirationDate, fakeAccount);

    console.log('done debbie!')
  }

  private async recalcSpreads() {
    this.analyzedDebitSpreads = []

    this.allSymbols.forEach(async symbol => {

      let optionChain: any

      try {
        optionChain = await this.tdApiSvc.getOptionChainForSymbol(symbol);
      }
      catch (err) {
        console.log('#$# couldn\'t get options chains for: ', symbol)
      }

      if (optionChain['underlying']) {

        console.log('#$# analyzing spreads for ', symbol, optionChain.putExpDateMap, optionChain.underlying)

        const callSpreads = this.strangulator.getPennyCallSpreads(symbol, optionChain.callExpDateMap, optionChain.underlying)
        const putSpreads = this.strangulator.getPennyPutSpreads(symbol, optionChain.putExpDateMap, optionChain.underlying)

        this.analyzedDebitSpreads.push(...callSpreads)
        this.analyzedDebitSpreads.push(...putSpreads)

        this.sortDebitSpreads();

      }
    })
  }

  private sortDebitSpreads() {
    this.analyzedDebitSpreads = this.analyzedDebitSpreads.sort((a, b) => {
      
      if (+a.expirationDaysLeft === +b.expirationDaysLeft) {
        return a.midpointDifference < b.midpointDifference ? -1 : 1
      }
      else {
        return +a.expirationDaysLeft > +b.expirationDaysLeft ? -1 : 1
      }
      
    })
  }
}

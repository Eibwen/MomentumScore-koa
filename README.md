# MomentumScore-koa

This is a metric for stock prices based on https://github.com/kyle-banner/momentum-score and built concurrently (yet disconnected) with https://github.com/kyle-banner/moscore

Original library work here: https://gist.github.com/Eibwen/8fe8e8fca15ddf1fc566

## Usage

    cd moscore-koa
    npm start

Browse to localhost:3000

## TODO

- [ ] Add a table sorting library (and have percentages  and such support that somehow)
- [ ] Actually build the momentum_score into a npm and import it using that
- [ ] Improve the ui... somehow... profit.
- [x] Shade color the percentages
- [x] WANT: ability to tag stocks you own (using local storage for now) and highlight them
- [ ] "Go back in time" set a date to view the status then
- [ ] Save history to disk, to get a sense of what 'good' and 'bad' values actually mean
- [ ] Geneate full historical moscore analysis of a stock (and output to graphs, similar to what we have now, but showing the weighting and everything)
- [ ] Add other metrics to the output
- [ ] Normalize to an index fund
- [ ] Add custom labels, using localStorage
- [ ] Support more metrics better
 - Such as: http://www.investopedia.com/articles/fundamental-analysis/09/five-must-have-metrics-value-investors.asp?layout=infini&v=1B

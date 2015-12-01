# MomentumScore-koa

This is a metric for stock prices based on https://github.com/kyle-banner/momentum-score and built concurrently (yet disconnected) with https://github.com/kyle-banner/moscore
Original library work here: https://gist.github.com/Eibwen/8fe8e8fca15ddf1fc566

## Usage

    cd moscore-koa
    npm start

Browse to localhost:3000

## TODO

- [ ] Actually build the momentum_score into a npm and import it using that
- [ ] Make the output easier to read
- [ ] WANT: ability to tag stocks you own (using local storage for now) and highlight them
- [ ] Save history to disk, to get a sense of what 'good' and 'bad' values actually mean
- [ ] Geneate full historical moscore analysis of a stock (and output to graphs, similar to what we have now, but showing the weighting and everything)

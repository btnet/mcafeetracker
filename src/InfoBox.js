import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';

import './InfoBox.css';

class InfoBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPrice: null,
      monthChangeD: null,
      monthChangeP: null,
      updatedAt: null,
      mcAfeePrice: null
    }
  }
  componentDidMount(){
    this.getData = () => {
      const {data} = this.props;
      const url = 'https://api.coindesk.com/v1/bpi/currentprice.json';

      fetch(url).then(r => r.json())
        .then((bitcoinData) => {
          const price = bitcoinData.bpi.USD.rate_float;
          const change = price - data[0].y;
          const changeP = (price - data[0].y) / data[0].y * 100;

          this.setState({
            currentPrice: bitcoinData.bpi.USD.rate_float,
            monthChangeD: change.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }),
            monthChangeP: changeP.toFixed(2) + '%',
            updatedAt: bitcoinData.time.updatedISO,
            mcAfeePrice: this.getMcAfeePrice()
          })
        })
        .catch((e) => {
          console.log(e);
        });
    }
    this.getData();
    this.refresh = setInterval(() => this.getData(), 60000);
    this.refresh = setInterval(() => this.refreshMcAfeePrice(), 10000);
  }
  componentWillUnmount(){
    clearInterval(this.refresh);
  }

  refreshMcAfeePrice() {
    this.setState({
      mcAfeePrice: this.getMcAfeePrice()
    })
  }

  // No Paramter because this is realtime
  getDaysSincePrediction() {
    const {tweetDate} = this.props;
    return moment().diff(moment(tweetDate),'days', true)
  }

  // No Paramter because this is realtime
  getMcAfeePrice(){
    const goalRate = 1+this.props.growthRate;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet
    return Math.pow(goalRate, this.getDaysSincePrediction()) * tweetPrice;
  }

  getAheadOrBehind() {
    if (this.state.currentPrice>this.state.mcAfeePrice)
    { return ('ahead'); } else { return 'behind' ; }
  }

  render(){
    return (
      <Row>
          <Col xs={4} md={2} mdOffset={3} height={"5em"}>
            <div className="subtext">Predicted</div>
            <div className="heading predicted">{ this.state.mcAfeePrice ? this.state.mcAfeePrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) : 'thinking...' }</div>
            <div className="subtext">steady growth</div>
          </Col>

          <Col xs={4} md={2} height={"5em"}>
            <div className="subtext">Actual</div>
            <div className="heading actual">{ this.state.currentPrice ? this.state.currentPrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) : 'loading...' }</div>
            <div className="subtext">{ this.state.updatedAt ? moment(this.state.updatedAt).format('YYYY-MM-DD hh:mm A') : null }</div>
          </Col>

          <Col xs={4} md={2} height={"5em"}>
            <div className="subtext">Bitcoin is</div>
            <div className={"heading "+this.getAheadOrBehind() }>{ this.state.currentPrice ? (this.state.currentPrice/this.state.mcAfeePrice-1).toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 4}) : '...' }</div>
            <div className="subtext">{this.getAheadOrBehind()} of his prediction</div>
          </Col>
      </Row>
    );
  }
}

// DEFAULT PROPS
InfoBox.defaultProps = {
  tweetDate:  '2017-07-17 00:00:00',         // Date of first McAfee Tweet
  tweetPrice:  2244.265,            // USD/BTC on TweetDate
  targetDate:  '2020-12-31',        // Day McAfee predicted the price
  targetPrice: 1000000,             // revised prediction (1Million)
  growthRate:  0.00484095703431026  // daily growth rate to goal of 1.000.000 USD/BTC
}

export default InfoBox;

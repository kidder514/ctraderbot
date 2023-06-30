const fixclient = require('./fixclient');
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const { PAIR_TO_SYMBOL_MAP, getStopLossPrice, fixStringToObj, now, readVolumeFromJsonFile, writeVolumneToJsonFile } = require('./util/util');

const appPort = 80;
const initialCurrentOrder = {
    orderStatus: 'NONE', // NONE, ORDER_PLACED, ORDER_N_SL_PLACED, CLEARING_ORDER,
    orderId: undefined,
    pair: undefined,
    direction: undefined,
    volumne: undefined,
    price: undefined,
    executionReport: false,
    executionReportSL: false,
};

global.stopLoss = 0.3; // this is for JPY only, and is what I am currently working on
global.baseVolumne = 1000;
global.maxVolumne = baseVolumne * 14;
global.isLoggedIn = false;

global.lastOrderWin = undefined; // default to true so it starts with base volumne



global.lastOrderVolume = baseVolumne;
readVolumeFromJsonFile().then(res => {
    if (res) {
        lastOrderVolume = res;
    }
})
global.currentOrder = initialCurrentOrder;

// demo
const client = new fixclient({
    fixVersion: 'FIX.4.4',
    host: 'h51.p.ctrader.com',
    port: '5202',
    sender: 'demo.icmarkets.8721133',
    target: 'cServer',
    accountID: '8721133',
    accountPassword: 'k3224379514'
}, 'TRADE');

// Juno
// const client = new fixclient({
//     fixVersion: 'FIX.4.4',
//     host: 'h22.p.ctrader.com',
//     port: '5202',
//     sender: 'live2.icmarkets.2223288',
//     target: 'cServer',
//     accountID: '2223288',
//     accountPassword: 'k3224379514'
// }, 'TRADE');

client.connect();
setTimeout(() => {
    client.sendLogon();

    var logoutTimer = setInterval(() => {
        if (isLoggedIn === false) {
            client.sendLogon();
            clearInterval(logoutTimer);
        }
    }, 10000)
}, 5000)


app.use(bodyParser.json());
// used to check server status
app.get('/check', async (req, res) => {
    console.log(`[${now()}] @@@@@ CHECK restapi called ===================================`);
    console.log(req.protocol + '://' + req.get('host') + req.originalUrl);

    res.sendStatus(404);
});

app.get('/reset', async (req, res) => {
    console.log(`[${now()}] @@@@@ RESET restapi called ===================================`);
    console.log(req.protocol + '://' + req.get('host') + req.originalUrl);

    currentOrder = initialCurrentOrder;
    lastOrderWin = undefined;
    lastOrderVolume = undefined;
    await writeVolumneToJsonFile(baseVolumne);

    res.sendStatus(404);
});

// path /trade/AUDUSD/BUY or /trade/GBPUSD/SELL
app.post('/trade', (req, res) => {
    console.log(`[${now()}] @@@@@ ORDER restapi called ===================================`);
    console.log(`[${now()}] ${req.originalUrl} ${JSON.stringify(req.body)}`);
    const { pair, direction } = req.body;

    // close existing position ==============================================
    if (currentOrder.orderStatus === 'ORDER_N_SL_PLACED' || currentOrder.orderStatus === 'CLEARING_ORDER') {
        console.log(`[${now()}] Order: Closing ============================= `);
        currentOrder.orderStatus = 'CLEARING_ORDER';
        let reportObj = fixStringToObj(currentOrder.executionReport.string);
        let posMaintRptID = reportObj.PosMaintRptID;
        client.sendNewOrder({
            label: 'close position',
            securityObj: {
                symbol: PAIR_TO_SYMBOL_MAP[currentOrder.pair.toUpperCase()],
                fixSymbolID: PAIR_TO_SYMBOL_MAP[currentOrder.pair.toUpperCase()],
            },
            orderQty: currentOrder.volumne, // TODO calculate the volumne
            direction: currentOrder.direction.toUpperCase() === 'BUY' ? 'SELL' : 'BUY', //'BUY' or 'SELL', needs to be the oppsite of previous order
            posMaintRptID,
        });
    }

    // close existing SL ====================================================
    if (currentOrder.orderStatus === 'ORDER_N_SL_PLACED' || currentOrder.orderStatus === 'CLEARING_ORDER') {
        console.log(`[${now()}] SL: Closing =============================`);
        currentOrder.orderStatus = 'CLEARING_ORDER';
        let reportObj = fixStringToObj(currentOrder.executionReportSL.string);
        client.orderCancelRequest(reportObj.ClOrdID)
    }

    let time = new Date();
    let hour = time.getHours()
    if (hour <= 2 || hour >= 17) {
        // place new order ============================================================
        var orderTimer = setInterval(() => {
            console.log(`[${now()}] Order: Waiting to create =======================`);
            if (currentOrder.orderStatus === 'NONE') {
                let orderVolume;
                if (lastOrderWin == undefined) {
                    orderVolume = lastOrderVolume ? lastOrderVolume : baseVolumne;
                } else if (lastOrderWin) {
                    orderVolume = baseVolumne;
                } else {
                    orderVolume = lastOrderVolume * 2;
                }
                if (orderVolume > maxVolumne) { orderVolume = maxVolumne; }
                client.sendNewOrder({
                    label: 'Order',
                    securityObj: {
                        symbol: PAIR_TO_SYMBOL_MAP[pair.toUpperCase()],
                        fixSymbolID: PAIR_TO_SYMBOL_MAP[pair.toUpperCase()],
                    },
                    orderQty: orderVolume,
                    direction: direction.toUpperCase(), //'BUY' or 'SELL'
                });
                clearInterval(orderTimer);
            }
        }, 1000)


        // add SL to new order ==============================================
        var sltimer = setInterval(() => {
            console.log(`[${now()}] SL: Waiting to create ======================`);
            if (currentOrder.orderStatus === 'ORDER_PLACED') {
                clearInterval(sltimer);
                client.sendStopOrder({
                    label: 'SL',
                    securityObj: {
                        symbol: PAIR_TO_SYMBOL_MAP[pair.toUpperCase()],
                        fixSymbolID: PAIR_TO_SYMBOL_MAP[pair.toUpperCase()],
                    },
                    executionReport: currentOrder.executionReport,
                    currentFIXPosition: undefined,
                    stopPx: getStopLossPrice(currentOrder.price, currentOrder.direction),
                });
            }
        }, 1000);
    } else {
        console.log(`[${now()}]current hour is ${hour}, it is not in the trading hour from 17-03`);
    }

    res.sendStatus(404);
})

app.listen(appPort, () => {
    console.log(`App listening on port ${appPort}`)
})

// version 1.1
// logging cloudwatch to mobile phone
// add close all options

const PAIR_TO_SYMBOL_MAP = {
    'USDAUD': 5,
    'AUDUSD': 5,
    'USDJPY': 4,
    'JPYUSD': 4,
    'CADUSD': 8,
    'USDCAD': 8,
    'EURUSD': 1,
    'USDEUR': 1,
    'GBPUSD': 2,
    'USDGBP': 2,
    'US30': 10015
}

const SYMBOL_TO_PAIR_MAP = {
    5: 'USDAUD',
    5: 'AUDUSD',
    4: 'USDJPY',
    4: 'JPYUSD',
    8: 'CADUSD',
    8: 'USDCAD',
    1: 'EURUSD',
    1: 'USDEUR',
    2: 'GBPUSD',
    2: 'USDGBP',
    10015: 'US30',
}

const NUMBER_TO_TEXT = {
    '6': 'AvgPx',// No Any valid value Integer A price at which the deal was filled. For an IOC or GTD order, this is the Volume Weighted Average Price (VWAP) of the filled order.
    '8': 'BeginString', // Yes FIX.4.4 String Always unencrypted, must be the first field in a message.
    '9': 'BodyLength', // Yes Any valid value Integer Message body length. Always unencrypted, must be the second field in a message.
    '10': 'checksum',
    '11': 'ClOrdID',// Yes Any valid value String A unique identifier of the order allocated by the client.
    '14': 'CumQty',// No Any valid value Qty The total number of orders which have been filled.
    '32': 'LastQty',// No Any valid value Qty The bought/sold quantity of orders which have been filled on this (last) fill.
    '34': 'MsgSeqNum', // Yes 1 Integer A sequence number of the message.
    '35': 'MsgType', // Yes A String A message type. Always unencrypted, must be the third field in a message.
    '37': 'OrderID',// Yes Any valid value String A cTrader order ID.
    '38': 'OrderQty',// Yes/No Any valid value Qty This represents the number of shares for equities or based on normal convention the number of contracts for options, futures, convertible bonds, etc. Prior to FIX 4.2, the type of this field was 'Integer'.
    '39': 'OrdStatus',// Yes Any valid value Char , see constant ORDSTATUS
    '40': 'OrdType',// Yes/No 1 or 2 Char 1 = Market;2 = Limit.
    '41': 'OrigClOrdID',
    '44': 'Price',// No Any valid value Price If supplied in a New Order Single message, it is echoed back in this Execution Report message.
    '45': 'RefSeqNum',
    '49': 'SenderCompID', // Yes Any valid value String An ID of the trading party in the following format: <Environment>.<BrokerUID>.<Trader Login>, where Environment is a determination of the server, like demo or live; BrokerUID is provided by cTrader, and Trader Login is a numeric identifier of the trader account.
    '50': 'SenderSubID', // No Any valid value String The assigned value used to identify a specific message originator. Must be set to QUOTE if TargetSubID=QUOTE.
    '52': 'SendingTime', // Yes 20131129-15:40:08.155 UTCTimestamp Time of the message transmission always expressed in UTC (Universal Time Coordinated, also known as GMT).
    '54': 'Side',// Yes 1 or 2 Integer 1 = Buy;2 = Sell.
    '55': 'Symbol',// Yes Any valid value Long Instrument identificators are provided by Spotware.
    '56': 'TargetCompID', // Yes CSERVER String A message target. The valid value is CSERVER.
    '57': 'TargetSubID', // Yes QUOTE or TRADE String An additional session qualifier. Possible values are QUOTE and TRADE.
    '58': 'Text',// No Any valid value String Where possible, a message will explain the Execution Report.
    '59': 'TimeInForce',// No 1, 3 or 6 String Deprecated, this value will be ignored. TimeInForce will be detected automatically depending on OrdType (tag=40) and ExpireTime (tag=126):
    '60': 'TransactTime',// No/YES Any valid value Timestamp Execution time of a transaction represented by the Execution Report message (in UTC).
    '98': 'EncryptMethod', // Yes 0 Integer Defines a message encryption scheme. Currently, only transport-level security is supported. The valid value is 0 = NONE_OTHER (encryption is not used).
    '99': 'StopPx',// No Any valid value Price If supplied in a New Order Single message, it is echoed back in this Execution Report message.
    '103': 'OrdRejReason',// No 0 Integer 0 = OrdRejReason.BROKER_EXCHANGE_OPTION
    '108': 'HeartBtInt', // Yes Any valid value Integer A heartbeat interval in seconds. The value is set in the config.properties file (client side) as SERVER.POLLING.INTERVAL The default interval value is 30 seconds. If HeartBtInt is set to 0, no heartbeat message is required.
    '112': 'TestReqID',
    '126': 'ExpireTime',// No 20140215-07:24:55 Timestamp Expire time in the 'YYYYMMDD-HH:MM:SS' format. If assigned, the order will be processed by the GTD scheme (TimeInForce: GTD).
    '141': 'ResetSeqNumFlag', // No Y Boolean All sides of the FIX session should have the sequence numbers reset. The valid value is Y (reset).
    '150': 'ExecType', // Yes any valid value Char  see constant EXECTYPE
    '151': 'LeavesQty',// No Any valid value Qty The number of orders still to be filled. Possible values are between 0 (fully filled) and OrderQty (partially filled).
    '354': 'EncodedTextLen',
    '355': 'EncodedText',
    '371': 'RefTagID',
    '372': 'RefMsgType',
    '373': 'SessionRejectReason',
    '379': 'BusinessRejectRefID',
    '380': 'BusinessRejectReason',
    '494': 'Designation',// No Any valid value String A custom order label of the client.
    '553': 'Username', // No Any valid value String A numeric User ID. The user is linked to the SenderCompID value (the user’s organization, tag=49).
    '554': 'Password', // No Any valid value String A user password.
    '584': 'MassStatusReqID',// No Any valid value String A unique ID of the mass status request as assigned by the client.
    '721': 'PosMaintRptID',// No Any valid value String A position ID where this order should be placed. If not set, a new position will be created and its ID will be returned in the Execution Report message. It can be specified only for hedged accounts.
    '911': 'TotNumReports',// No Any valid value Integer The total number of reports returned in response to the Order Mass Status Request message.
    '1000': 'AbsoluteTP',// No Any valid value Price An absolute price at which the take profit will be triggered.
    '1001': 'RelativeTP',// No Any valid value Price A distance in pips from the entry price at which the take profit will be triggered.
    '1002': 'AbsoluteSL',// No Any valid value Price An absolute price at which the stop loss will be triggered.
    '1003': 'RelativeSL',// No Any valid value Price A distance in pips from the entry price at which the stop loss will be triggered.
    '1004': 'TrailingSL',// No N or Y Boolean Indicates if the stop loss is trailing. N = Stop loss is not trailing; Y = Stop loss is trailing.
    '1005': 'TriggerMethodSL',// No Any valid value Integer An indicated trigger method of the stop loss.
    '1006': 'GuaranteedSL',// No N or Y Boolean Indicates if the stop loss is guaranteed.N = Stop loss is not guaranteed;
};

const EXECTYPE = {
    '0': 'New',
    '4': 'Canceled',
    '5': 'Replace',
    '8': 'Rejected',
    'C': 'Expired',
    'F': 'Trade',
    'I': 'Order Status',
}

const ORDSTATUS = {
    '0': 'New',
    '1': 'Partially filled',
    '2': 'Filled',
    '8': 'Rejected',
    '4': 'Canceled (when the order is partially filled, Canceled is returned signifying (tag=151), LeavesQty is canceled and will not be subsequently filled)',
    'C': 'Expired',
}

const SIDE = {
    '1': 'BUY',
    '2': 'SELL',
}


const ORDERTYPE = {
    '1': 'MARKET',
    '2': 'LIMIT',
    '3': 'STOP'
}

const TRIGGERMETHODSL = {
    '1': 'Stop loss will be triggered by the trade side',
    '2': 'Stop loss will be triggered by the opposite side (ask for buy positions and by bid for sell positions)',
    '3': 'Stop loss will be triggered after two consecutive ticks according to the trade side',
    '4': 'Stop loss will be triggered after two consecutive ticks according to the opposite side (the second ask tick for buy positions and the second bid tick for sell positions)',

}


const fixStringToDescriptive = (fixstring) => {
    if (!fixstring) return '';
    let arr = fixstring.split('\x01');
    let output = '';
    arr.forEach((pair) => {
        if (pair.length > 0) {
            let pairArr = pair.split("=");

            output = output + NUMBER_TO_TEXT[pairArr[0]] + ':';
            switch (pairArr[0]) {
                case '150':
                    output = output + EXECTYPE[pairArr[1]] + ',';
                    break;
                case '39':
                    output = output + ORDSTATUS[pairArr[1]] + ',';
                    break
                case '54':
                    output = output + SIDE[pairArr[1]] + ',';
                    break
                case '55':
                    output = output + SYMBOL_TO_PAIR_MAP[pairArr[1]] + ',';
                    break
                case '40':
                    output = output + ORDERTYPE[pairArr[1]] + ',';
                    break
                case '1005':
                    output = output + TRIGGERMETHODSL[pairArr[1]] + ',';
                default:
                    output = output + pairArr[1] + ','
            }
        }
    })
    return '{' + output + '}';
}

const fixStringToObj = (fixString) => {
    const descriptiveString = fixStringToDescriptive(fixString);
    let bracketSliced = descriptiveString.slice(1, descriptiveString.length - 1);
    let arr = bracketSliced.split(',');
    obj = {};
    arr.forEach(item => {
        if (item !== '') {
            let splitedItem = item.split(/:(.*)/s)
            obj[splitedItem[0]] = splitedItem[1];
        }
    })
    return { ...obj };
}

const getStopLossPrice = (price, direction) => {
    // invert the position
    if (direction.toLowerCase() === 'sell') {
        return (parseFloat(price) + stopLoss).toFixed(5);;
    } else if (direction.toLowerCase() === 'buy') {
        return (parseFloat(price) - stopLoss).toFixed(5);
    } else {
        return 9999999999; //invalide number to fail this order
    }
}

const didYouWin = (_closingOrder, closingReport) => {
    if (_closingOrder.direction === 'BUY') {
        return parseFloat(closingReport.AvgPx) > parseFloat(_closingOrder.price);
    } else {
        return parseFloat(closingReport.AvgPx) < parseFloat(_closingOrder.price);
    }
}

const now = () => {
    // return '';
    // pm2 has a option to output log time so we dont need this any more.

    const date = new Date();
    return `[${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}]${date.getHours()}=${date.getMinutes()}=${date.getSeconds()}_${date.getMilliseconds()}`
}

module.exports = { PAIR_TO_SYMBOL_MAP, SYMBOL_TO_PAIR_MAP, getStopLossPrice, fixStringToDescriptive, fixStringToObj, didYouWin, now };
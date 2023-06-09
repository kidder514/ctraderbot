const { EventEmitter } = require('events')
const Messages = require('../constants/ConstantsMessage')
const Fields = require('../constants/ConstantsField')
const Field = require('../fields/Field')
const { fixStringToDescriptive, fixStringToObj, didYouWin, now } = require('../../../util/util');
const initialCurrentOrder = { // if you need to update this, do it also on index.js file
    orderStatus: 'NONE', // NONE, ORDER_PLACED, ORDER_N_SL_PLACED, CLEARING_ORDER, 'CLOSING'
    orderId: undefined,
    pair: undefined,
    direction: undefined,
    volumne: undefined,
    price: undefined,
    executionReport: false,
    executionReportSL: false,
};

class FIXParserClientBase extends EventEmitter {
    constructor(eventEmitter, parser) {
        super();
        this.eventEmitter = eventEmitter;
        this.fixParser = parser;
        this.host = null;
        this.port = null;
        this.client = null;
        this.socket = null;
        this.sender = null;
        this.target = null;
        this.heartBeatInterval = null;
        this.heartBeatIntervalId = null;
    }

    stopHeartbeat() {
        clearInterval(this.heartBeatIntervalId);
    }

    startHeartbeat() {
        this.stopHeartbeat();
        const sendHeartbeat = () => {
            const heartBeat = this.fixParser.createMessage(
                new Field(Fields.MsgType, 0),
                new Field(
                    Fields.MsgSeqNum,
                    this.fixParser.getNextTargetMsgSeqNum()
                ),
                new Field(Fields.SenderCompID, this.sender),
                new Field(Fields.SendingTime, this.fixParser.getTimestamp()),
                new Field(Fields.TargetCompID, this.target)
            );
            this.send(heartBeat);
        }
        this.heartBeatIntervalId = setInterval(sendHeartbeat, this.heartBeatInterval);
    }

    processMessage(message) {
        if (message.messageType === Messages.SequenceReset) {
            const newSeqNo = (this.fixParser.getField(Fields.NewSeqNo) || {})
                .value;
            if (newSeqNo) {
                console.log(
                    `[${Date.now()}] FIXClient new sequence number ${newSeqNo}`
                );
                this.fixParser.setNextTargetMsgSeqNum(newSeqNo);
            }
        }

        if (message.description === 'Heartbeat') {
            process.stdout.write(`[${now()}] **********Hearbeat************`);
        } else if (message.description === 'Logout') {
            console.log(`[${now()}] Received message: ${message.description} ===========================================`);
            console.log(fixStringToDescriptive(message.string));
            console.log(message.string);
        } else if (message.description === 'Reject') {
            console.log(`[${now()}] Received message: ${message.description} ===========================================`);
            console.log(fixStringToDescriptive(message.string));
            console.log(message.string);
        } else {
            console.log(`[${now()}] Received message: ${message.description} ===========================================`);
            // console.log(fixStringToDescriptive(message.string));
            // console.log(message.string);
        }

        if (message.description === 'ExecutionReport') {
            const reportObj = fixStringToObj(message.string);

            if (reportObj.Designation === 'close position') {
                if (reportObj.OrdType === 'MARKET' && reportObj.OrdStatus === 'New' && reportObj.ExecType === 'New') {
                    // closing existing position, do nothing
                }
                if (reportObj.OrdType === 'MARKET' && reportObj.OrdStatus === 'Filled' && reportObj.ExecType === 'Trade') {
                    // closing position completed!
                    console.log(`[${now()}] Order: Closed ===========================================`);
                    if (currentOrder.orderStatus === 'CLEARING_ORDER') { // AvgPx Side
                        lastOrderWin = didYouWin(currentOrder, reportObj)
                        lastOrderVolume = currentOrder.volumne;
                        if (currentOrder.executionReportSL === false) {
                            currentOrder = initialCurrentOrder;
                        } else {
                            currentOrder.executionReport = false;
                        }
                    }
                }
            }

            // close SL order doesnt trigger this
            if (reportObj.Designation === 'close sl order') {
                if (reportObj.OrdType === 'MARKET' && reportObj.OrdStatus === 'New' && reportObj.ExecType === 'New') {
                }
                if (reportObj.OrdType === 'MARKET' && reportObj.OrdStatus === 'Filled' && reportObj.ExecType === 'Trade') {
                }
            }

            if (reportObj.Designation === 'Order') {
                if (reportObj.OrdType === 'MARKET' && reportObj.OrdStatus === 'New' && reportObj.ExecType === 'New') {
                    // creating new order
                    // creating second order
                    // close order
                    // do nothing
                }
                if (reportObj.OrdType === 'MARKET' && reportObj.OrdStatus === 'Filled' && reportObj.ExecType === 'Trade') {
                    // new order filled, position created
                    // second order filled, position created
                    // close order
                    console.log(`[${now()}] Order: Created ===========================================`);
                    currentOrder = {
                        orderStatus: 'ORDER_PLACED', // NONE, ORDER_PLACED, ORDER_N_SL_PLACED, CLEARING_ORDER
                        orderId: reportObj.OrderID,
                        pair: reportObj.Symbol,
                        direction: reportObj.Side,
                        volumne: reportObj.OrderQty,
                        price: reportObj.AvgPx,
                        executionReport: message,
                        executionReportSL: false,
                    };
                }
            }

            if (reportObj.Designation === 'SL') {
                if (reportObj.OrdType === 'STOP' && reportObj.OrdStatus === 'New' && reportObj.ExecType === 'New') {
                    // order created, this already mean the order SL is set up
                    console.log(`[${now()}] SL: created ===========================================`);
                    currentOrder.executionReportSL = message;
                    currentOrder.orderStatus = 'ORDER_N_SL_PLACED'
                }
                if (reportObj.OrdType === 'STOP' && reportObj.OrdStatus === 'Filled' && reportObj.ExecType === 'Trade') {
                    // SL Hit !!!!!
                    console.log(`[${now()}] SL: HIT!!!!! ===========================================`);
                    currentOrder = initialCurrentOrder;
                    lastOrderWin = false;
                    lastOrderVolume = currentOrder.volumne;
                }
                if (reportObj.OrdType === 'STOP' && reportObj.OrdStatus === 'Canceled (when the order is partially filled' && reportObj.ExecType === 'Canceled') {
                    // order cancelled by machine
                    // order cancelled by hand
                    console.log(`[${now()}] SL: Closed ===========================================`);
                    if (currentOrder.orderStatus === 'CLEARING_ORDER') {
                        if (currentOrder.executionReport === false) {
                            currentOrder = initialCurrentOrder;
                        } else {
                            currentOrder.executionReportSL = false;
                        }
                    }
                }
            }
        }
    }
}

module.exports = FIXParserClientBase

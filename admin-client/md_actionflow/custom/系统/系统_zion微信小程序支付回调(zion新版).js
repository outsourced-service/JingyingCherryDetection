/**
 * 简介：
 * 此代码块用于解析支付相关数据，并提取关键信息（如订单ID、支付状态等）。
 * 开发者可利用这些信息进行后续业务逻辑的处理和实现。
 *
 * 步骤：
 * 1. 解析支付回调数据，获取 out_trade_no（系统生成的唯一订单标识符） 和支付状态
 * 2. 根据 out_trade_no 查询支付记录
 * 3. 返回订单ID和支付状态
 */


// 获取支付回调的数据
const paymentCallbackBody = context.getArg('fz_payment_callback_input');
context.callActionFlow(
    '6a5fb3d9-e3e0-4d5e-b11c-f6a939d2d1bb',
    null,
    {
        actionflow_name: '系统_zion微信小程序支付回调', // 代码块名称
        payload: {
            fz_payment_callback_input: paymentCallbackBody
        }
    }
);
if (false) {

    // result_code表示支付的状态: SUCCESSFUL / FAILED
    const result_code = paymentCallbackBody.result_code;

    // 返回支付状态
    const paymentStatus = result_code === 'SUCCESS' ? 'SUCCESSFUL' : 'FAILED';

    // outTradeNo是系统用Order ID生成的唯一订单标识符，可以用它作为筛选条件获取对应的支付记录
    const outTradeNo = paymentCallbackBody.out_trade_no;

    // transactionId 是微信后端的支付记录id
    const transactionId = paymentCallbackBody.transaction_id;

    // 修改outTradeNo对应的支付记录的状态
    const updatePaymentStatusGql = `mutation updatePaymentStatus($outTradeNo: String!, $paymentStatus: String!) {
  update_fz_payment_record(_set: {status: $paymentStatus}, where: {out_trade_no: {_eq: $outTradeNo}, status: {_neq: $paymentStatus}}) {
    affected_rows
  }
}`;
    const { update_fz_payment_record } = context.runGql(
        'updatePaymentStatus',
        updatePaymentStatusGql,
        { outTradeNo, paymentStatus },
        { role: 'admin' }
    );

    // 由于支付的回调可能重复发送，所以需要通过callbackProcessed判断当前callback是否曾经处理过
    const callbackProcessed = update_fz_payment_record.affected_rows == 0;

    // 修改对应的支付记录的transactionId
    if (paymentStatus == 'SUCCESSFUL') {
        context.updateTransactionIdByOutTradeNo(outTradeNo, transactionId);
    }

    // 用outTradeNo作为过滤条件获取相应的支付记录
    const { fz_payment_record } = context.runGql(
        'retrieve_payment_record',
        `query retrieve_payment_record($outTradeNo:String!){
    fz_payment_record(
      where:{
        out_trade_no:{
          _eq: $outTradeNo
        }
      }
    ){
      id,type, grand_total_value, currency, description, order_id, transaction_id, account_id, recurring_payment_id
    }
  }`,
        { outTradeNo },
        { role: 'admin' }
    );

    // 从支付记录中获取数据，其中order_id会作为代码块输出
    // 如果你需求输出其他数据，可以在后面自行添加
    const {
        id,
        type,
        grand_total_value,
        currency,
        description,
        order_id,
        transaction_id,
        account_id,
        recurring_payment_id
    } = fz_payment_record[0];

    // 返回订单ID 支付状态
    context.setReturn('orderId', order_id);
    context.setReturn('paymentStatus', paymentStatus);
    context.setReturn('callbackProcessed', callbackProcessed);
    context.setReturn('zion_payment_id', id);
    context.setReturn('transaction_id', transaction_id);
}
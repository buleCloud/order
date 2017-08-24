var app = getApp()//获取应用实例
const getOrderDetails = app.globalData.host + '/dcan/menu/order/detail/get' //获取订单详情
Page({
  data: {
    order_details: [],
    tel:null,
  },
  onLoad: function (options) {
    let that = this
    let out_trade_no = options.out_trade_no
    let param = {
      out_trade_no: out_trade_no      
    }
    app.getRequest(getOrderDetails, param, function (res) {
      if (res && res.data.statusCode) {
        that.setData({
          order_details: res.data.data.list,
          order_price_detail: res.data.data.pay_order_vo,
          tel: app.globalData.telPhone,  
        })
      }
    })    
  },

  calling: function (e) {
    wx.makePhoneCall({
      phoneNumber: app.globalData.telPhone, //此号码并非真实电话号码，仅用于测试
      success: function () {
      },
      fail: function () {
      }
    })
  },
  goIndex : function(e){ //返回首页清空购物车

    wx.redirectTo({
      url: '../../index/index'
    })
  }
})
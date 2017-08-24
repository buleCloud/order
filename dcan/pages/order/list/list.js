var app = getApp()//获取应用实例
const getOrderList = app.globalData.host + '/dcan/user/order/get' //获取订单列表
const common = require('../../../common.js')
Page({
  data:{
    order_list : [],
    order_status : false,
  },

  onLoad:function(){
    let that = this;
    let ssid = wx.getStorageSync(app.globalData.ssidFlag);
    let param = {
      ssid : ssid
    }
    app.getRequest(getOrderList,param,function(res){
      if(res && res.data.statusCode == 200 && res.data.data.total_count > 0){
        that.setData({
          order_list : res.data.data.list,
          order_status : false,
        })
      }else{
        that.setData({
          order_list: [],
          order_status: true,
        })
      }
    })
  },
  goOrderDetails : function(e){
    let out_trade_no = e.currentTarget.dataset.out_trade_no
    wx.navigateTo({
      url: '../details/details?out_trade_no=' + out_trade_no,
    })
  }
})
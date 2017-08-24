var app = getApp()//获取应用实例
Page({
 data:{
    userInfo:{},
    tel:null,
 },

  onLoad:function(){
    var that = this
    app.getUserInfo(function (userInfo) {// 获取用户基础信息
      that.setData({
        userInfo: userInfo,
        tel: app.globalData.telPhone,        
      })
    })
    
  },

  goCoupon:function(e){
      wx.navigateTo({
        url: '../coupon/coupon',
      })
  },
  goOrderList:function(e){
    wx.navigateTo({
      url: '../order/list/list',
    })
  },

  calling:function(){
    wx.makePhoneCall({
      phoneNumber: app.globalData.telPhone, //此号码并非真实电话号码，仅用于测试
      success: function () {
      },
      fail: function () {
      }
    })
  }
})
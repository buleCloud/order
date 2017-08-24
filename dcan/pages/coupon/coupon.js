var app = getApp()//获取应用实例
const getCouponList = app.globalData.host + "/applet/can/use/coupons/get" //获取可用优惠券
Page({
  data: {
    list: [],
    couponBg: false,
    isShowImage: true
  },
  onLoad: function (options) {
    let that = this
    let ssid = wx.getStorageSync(app.globalData.ssidFlag)
    let param = {
      ssid: ssid,
    }
    app.getRequest(getCouponList, param, function (res) {
      if (res && res.data.statusCode == 200) {
        that.setData({
          coupon_list: res.data.data,
          isShowImage: false,
        })
      } else {
        that.setData({
          isShowImage: true,
        })
      }
    })
  }
})
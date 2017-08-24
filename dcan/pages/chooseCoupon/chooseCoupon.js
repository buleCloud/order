
var app = getApp()
var getyouhuijuanUrl = app.globalData.host + "/applet/can/use/coupons/get"; //请求优惠劵信息
Page({
  /**
   * 页面的初始数据
   */
  data: {
    coupon: '',
    // // 是否点击使用优惠劵
    isTrue: false,
    coupon_list : [],
    isChoose : 0,
    isShowImage:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取扩展数据
    var that = this
    that.setData({
      isChoose: options.total_fee - 0
    })

    var ssid = wx.getStorageSync(app.globalData.ssidFlag);

    that.getyouhuijuan(ssid, function (res) {
      if (res.statusCode == 200 && res.data.statusCode == 200) {
        that.setData({
          coupon_list: res.data.data,
          isShowImage:false
        })
      }
    })
  },

  //请求优惠劵方法 
  getyouhuijuan: function (ssid, succ) {
    var postParam = {
      ssid: ssid
    }
    app.getRequest(getyouhuijuanUrl, postParam, function (res) {
      succ && succ(res)
    });
  },



  // 选择使用优惠劵的点击事件
  useJuan: function (e) {
    const res = e.currentTarget.dataset;
    var coupons = {
      id: res.card_id,
      code: res.code,
      coupon_fee: res.reduce_cost,
      least_cost: res.least_cost,
      discount:res.discount//如果有折扣discount会有值
    }

    var that = this
    that.setData({
      isTrue: !that.data.isTrue,
      coupon: coupons,
      eventCard_id: res.card_id
    })
  },
  //选择完优惠劵跳转到支付页面
  topay: function () {
    if (this.data.coupon) {
      wx.setStorage({
        key: 'coupon',
        data: this.data.coupon,
      })
      wx.navigateBack({
        delta: 1
      })
    }
  }
})
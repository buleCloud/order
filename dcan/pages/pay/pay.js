var app = getApp()//获取应用实例
var getOrderSubmitUrl = app.globalData.host + "/dcan/menu/order/pay"; //订单提交
var getUserInfo = app.globalData.host + "/applet/user/pay/info/get"; //读取用户信息
var ssid = wx.getStorageSync(app.globalData.ssidFlag);
var menu_json ;
Page({
  data:{
    order_info:{},
    nickname : '',
    telphone : '',
    original_fee:'', //总原价
    total_fee: '', //实际总价
    cash_fee: '',
    coupon_fee: '',
    coupon_id: '',
    coupon_code: '',   
    remark:'', 

    chooseCoupon: ''//选择优惠券展示数据    
  },

  onLoad:function(options){

    var that = this;
    wx.removeStorage({
      key: 'coupon',
      success: function (res) {

      }
    })
    // 初始选择优惠券
    that.setData({
      chooseCoupon: '选择优惠券'
    })

    var that = this;
    let param = {
        ssid : ssid
    }
    app.getRequest(getUserInfo, param,function(res){
      if(res && res.data.statusCode == 200 && res.data.data){
        that.setData({
         nickname : res.data.data.name,
         telphone: res.data.data.phone
        })
      }
    }) 
    wx.getStorage({
      key: 'order_data',
      success: function (res) {
        that.setData({
          order_info: res.data,
          total_fee: res.data.total_fee,
          original_fee: res.data.original_fee
        })
        menu_json = res.data.menu_list    
      }
    })    
  },

  onShow: function () {
    // 页面再次显示的时候读取本地存储中存入的卡券信息
    var that = this
    wx.getStorage({
      key: 'coupon',
      success: function (res) {

        if(res.data.discount){
          that.setData({
            chooseCoupon: '已优惠' + res.data.discount * that.data.total_fee/10000 + '元',
            coupon_fee: that.data.total_fee- (100 - res.data.discount) / 100 * that.data.total_fee,
            coupon_id: res.data.id,
            coupon_code: res.data.code,
          })
        }else{
          that.setData({
            chooseCoupon: '已优惠' + res.data.coupon_fee / 100 + '元',
            coupon_fee: res.data.coupon_fee,
            coupon_id: res.data.id,
            coupon_code: res.data.code,
          })
        }
      }
    })
  },

  // 选择优惠券
  chooseCoupon: function () {
    wx.navigateTo({
      url: '../chooseCoupon/chooseCoupon' + '?' + 'total_fee=' + this.data.total_fee,
    })
  },  

  writeTel : function(e){
    var that = this;
    that.setData({
      telphone: e.detail.value
    })
  },
  writeName: function (e) {
    var that = this;
    that.setData({
      nickname: e.detail.value
    })
  },  
  whiteRemark: function (e) {
    var that = this;
    that.setData({
      remark: e.detail.value
    })
  },   
  submit:function(e){
    let scene = app.globalData.scene;
    let param = {
      menus_json: JSON.stringify(menu_json),
      ssid : ssid,
      appid: app.globalData.appid,
      total_fee: this.data.total_fee,
      cash_fee: this.data.total_fee - this.data.coupon_fee,
      coupon_id: this.data.coupon_id,
      coupon_fee: this.data.coupon_fee,
      coupon_code: this.data.coupon_code,
      scene: scene,
      uide: app.globalData.uide,
      phone: this.data.telphone,
      name: this.data.nickname,
      remark: this.data.remark
    }
    app.postRequest(getOrderSubmitUrl, param,function(res){
      if (res.statusCode == 200 && res.data.statusCode == 200) {
        let wxpackage = "prepay_id=" + res.data.data.prepay_id;
        let out_trade_no = res.data.data.out_trade_no;
        // 如果提交成功以后发起微信支付
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonce_str,
          'package': wxpackage,
          'signType': 'MD5',
          'paySign': res.data.data.pay_sign,
          'success': function (res) {

            app.globalData.shopCart = {
              menu_list: [],
              total_count: 0,
              total_fee: 0,
              original_fee: 0,
              has_dis_count: 0,
            };

            // 提交成功以后跳转到订单界面
            wx.navigateTo({
              url: '../order/details/details?out_trade_no=' + out_trade_no,
            })
          },
          'fail': function (res) {
          }
        })
      }
    })
  }
})
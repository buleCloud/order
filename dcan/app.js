var ssidFlag = "applet_ssid"
var ssidCheckUrl = "/applet/ssid/check"
var tLoginUrl = "/applet/login"
App({
  onLaunch: function () { //初始化
    var that = this
    let extConfig = wx.getExtConfigSync();
    let customHost = extConfig.host;
    let customAppid = extConfig.appid;
    if (customHost) { //将ext.json中得host赋值给global
      that.globalData.host = customHost;
    }
    if (customAppid) { //将ext.json中得appid赋值给global
      that.globalData.appid = customAppid;
    }    

    wx.showToast({  //注册页面时加载loading
      title: '加载中...',
      image:'images/loading.gif',
      mask:true,
    })
  },

  // 获取扩展APPID属性
  getExtEncrptyAppid: function (cb) {
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
    cb && cb(extConfig.appid);
  },

  // 获取用户信息
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) { //先读取本地用户信息
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else { 
      // 没有用户信息调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  // 获取登录过用户信息
  getLoginUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb === "function" && cb(this.globalData.userInfo)
    } else {
      wx.getUserInfo({
        withCredentials: true,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  // get请求
  getRequest: function (url, data, succ, fail, compile) {
    wx.request({
      url: url,
      data: data,
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },        
      success: function (res) {
        succ && succ(res);
      },
      fail: function (res) {
        fail && fail(res);
      }
    })
  },

  // post请求
  postRequest: function (url, data, succ, fail, compile) {
    wx.request({
      url: url,
      data: data,
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },      
      success: function (res) {
        succ && succ(res);
      },
      fail: function (res) {
        fail && fail(res);
      }
    })
  },

  // wx登录检测
  ssidCheck: function (ssid, encryptAppid, uide, succ) {
    var that = this;
    var requestParams = {
      ssid: ssid,
      aid: encryptAppid,
      uide: uide
    }
    let host = that.globalData.host;
    var checkUrl = host + ssidCheckUrl;
    that.getRequest(checkUrl, requestParams, function (res) {
      succ && succ(res)
    });
  },

  // 第三方登录
  tLogin: function (encryptAppid, uide) {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          var requestParam = {
            aid: encryptAppid,
            uide: uide,
            code: res.code
          }

          let host = that.globalData.host;
          var loginPostUrl = host + tLoginUrl;
          that.getRequest(loginPostUrl, requestParam, function (res) { //登陆成功获取ssid,写入本地存储
            wx.setStorageSync(ssidFlag, res.data.data.ssid);
          })
        }
      }
    })
  },

  // 全局数据
  globalData: {
    userInfo: null,
    extDdta: {},
    uide: null,
    ssidFlag: "applet_ssid",
    host: "http://dev-xcx.xianlaohu.com",
    appid:"wx0f3b66895668d7b4",
    sence: '',
    telPhone:'', //联系商家
    shopCart:{ //全局取用属性---购物车
      menu_list:[], //菜品列表 => 数组
      total_count : 0, //总量
      total_fee : 0, //实际总价格
      original_fee : 0, //总原价,
      has_dis_count :0, //折扣价格个数
    }
  },
})
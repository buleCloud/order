var app = getApp()//获取应用实例
const getIndexInfo = app.globalData.host + '/dcan/home' //初始化数据
const getDishList = app.globalData.host + '/dcan/menu/category/menus/get' //菜品分类
var getcardUrl = app.globalData.host + "/applet/coupon/get" //卡券列表
var getlqUrl = app.globalData.host + "/applet/coupon/get/call/back"; //领取卡券回调
const appid = app.globalData.appid
var zbCardType = 1;
var wonCardType = 2;
Page({
  data: {
    uide: null,
    userInfo: {}, //用户信息
    home_vo: {}, //首页信息
    category_list: [], //分类列表
    category_id: '', //分类ID,
    menu_list: [], //菜品列表

    click_coupon: '0',// 是否选中优惠券标识 1 选中 0未选中

    animateObj: {// 设置对象将其传入到模版页面
      animateX: '', //小球动画坐标
      animateY: '',
      animatePath: false, //小球运动轨迹
    },
    shopCart: app.globalData.shopCart, //加载时讲购物车所需字段填入
    listBg: false, //默认背景图,
    dish_count: 0,
    cart_exist_status: false, //点击购物车改变显示隐藏状态
    zbcardTitle : 0, //周边卡卷title
    woncardTitle: 0,//本店卡卷title
  },

  onLoad: function (option) { //生命周期函数--监听页面加载
    var that = this
    app.getUserInfo(function (userInfo) {// 获取用户基础信息
      that.setData({
        userInfo: userInfo
      })
    })

    //小程序二维码自定义场景值
    var scene = decodeURIComponent(option.scene)
    if (option.scene && scene) {
      app.globalData.scene = scene;
    } else {
      app.globalData.scene = wx.getExtConfigSync().sence;
    }

    // 参数唯一标识存储
    var uide = 0
    if (option.uide) {
      uide = option.uide;
    }
    app.globalData.uide = uide

    // 获取扩展数据
    var encryptAppid = null;
    app.getExtEncrptyAppid(function (res) {
      encryptAppid = res;
    })
    console.log("extApp:" + encryptAppid)

    // 第三方登录
    var appletSsid = wx.getStorageSync(app.globalData.ssidFlag);
    if (appletSsid && appletSsid != "undefined") {// 第三方登陆过
      wx.checkSession({
        success: function (res) {
          console.log("check session success...")

          app.ssidCheck(appletSsid, encryptAppid, uide, function (res) {
            if (res.data.statusCode != 200) {
              app.tLogin(encryptAppid, uide)
            }
          });
        },
        fail: function (res) {
          console.log("check session fail...")
          app.tLogin(encryptAppid, uide);
        }
      })
    } else {
      console.log('applet ssid is no-exist');
      app.tLogin(encryptAppid, uide);
    }
    // 获取扩展数据
    var appid = null;
    app.getExtEncrptyAppid(function (res) {
      appid = res;
    })

    that.getInitInfo(appid, uide, function (res) { //获取初始化数据
      if (res && res.statusCode == 200) {
        that.setData({
          home_vo: res.data.data.home_vo,
          category_list: res.data.data.category_list,
          category_id: res.data.data.category_list[0].id, // 默认展示第一个分类,
          select_menu_type: 0
        })
        app.globalData.telPhone = res.data.data.home_vo.phone; //将商家电话赋给全局

        that.getDishList(appid, that.data.category_id, function (res) { //第一次自动获取列表
          if (res && res.data.statusCode == 200 && res.data.data && res.data.data.list) {
            that.setData({
              menu_list: res.data.data.list,
              listBg: false,
            })
          } else {
            that.setData({
              menu_list: [],
              listBg: true,
            })
          }
        })

      }
    })

    wx.removeStorage({  //初始化清除缓存
      key: 'order_data',
      success: function (res) {
      }
    })
  },

  onShow: function () { //生命周期函数--监听页面显示
    let that = this;
    let temps_list = that.data.menu_list;
    let cart_menus = app.globalData.shopCart.menu_list

    if (cart_menus && cart_menus.length > 0) {
      for (let i = 0; i < cart_menus.length; i++) {
        for (let j = 0; j < temps_list.length; j++) {
          if (cart_menus[i].menu_id == temps_list[j].menu_id) {
            temps_list[j].menu_count = cart_menus[i].menu_count;
            that.setData({
              menu_list: temps_list,
            })
          }
        }
      }
    }


    that.setData({
      shopCart: app.globalData.shopCart
    })
  },
  onHide: function () { //生命周期函数--监听页面隐藏

  },

  getInitInfo: function (appid, uide, succ) {
    let indexParam = {
      appid: appid,
      uide: uide
    };
    app.getRequest(getIndexInfo, indexParam, function (res) {
      succ && succ(res)
    })
  },

  getDishList: function (appid, id, succ) {
    let dishParam = {
      appid: appid,
      category_id: id
    };
    app.getRequest(getDishList, dishParam, function (res) {
      succ && succ(res)
    })
  },

  goHome: function (e) { //点击home
    wx.navigateTo({
      url: '../user/user'
    })
  },

  chooseCategory: function (e) { //选择分类
    let that = this;
    var id = e.currentTarget.dataset.id;
    let show_menu_list = app.globalData.shopCart.menu_list; //永远显示选中
    let temp_menu_list = that.data.menu_list
    that.setData({
      category_id: id,
      click_coupon: '0'
    })
    that.getDishList(appid, id, function (res) { //获取菜品列表
      if (res && res.data.statusCode == 200 && res.data.data && res.data.data.list) {
        //将global中缓存数据与当前显示数据匹配  如果有 就显示 是否有已选择的菜品
        for (let i = 0; i < show_menu_list.length; i++) { // 
          for (let j = 0; j < res.data.data.list.length; j++) {
            if (res.data.data.list[j].menu_id == show_menu_list[i].menu_id) {
              res.data.data.list[j].menu_count = show_menu_list[i].menu_count
            }
          }
        }
        that.setData({
          menu_list: res.data.data.list,
          listBg: false,
        })
      } else {
        that.setData({
          menu_list: [],
          listBg: true,
        })
      }
    })
  },

  chooseCoupon: function (e) {  //获取优惠劵数据
    var that = this;

    that.setData({
      click_coupon: '1',
      category_id: null,
    })
    var uide = app.globalData.uide;
    // 小程序标识
    var ssid = wx.getStorageSync(app.globalData.ssidFlag);
    var postParam = {   // 请求周边卡券列表
      ssid: ssid,
      uide: uide,
      card_type: zbCardType
    }
    app.getRequest(getcardUrl, postParam, function (res) {
      if (res.statusCode == 200 && res.data.statusCode == 200) {
        that.setData({
          zbcardInfo: res.data.data.list,
          bgstatus: false,
          zbcardTitle: res.data.data.total_count
        })
      }
    })
    var postParam = {    // 请求周边卡券列表
      ssid: ssid,
      uide: uide,
      card_type: wonCardType
    }
    app.getRequest(getcardUrl, postParam, function (res) {
      if (res.statusCode == 200 && res.data.statusCode == 200) {
        that.setData({
          woncardInfo: res.data.data.list,
          bgstatus: false,
          woncardTitle: res.data.data.total_count
        })
      }
    })
  },


  getCoupon: function (event) {  //卡券领取回调
    this.setData({
      disabled: !this.data.disabled
    })
    var card_id = event.currentTarget.dataset.cardid;
    var card_ext = event.currentTarget.dataset.cardext;

    if (typeof wx.addCard === 'function') {
      wx.addCard({
        cardList: [
          {
            cardId: card_id,
            cardExt: card_ext
          }
        ],
        success: function (res) {
          var cardList = res.cardList; // 添加的卡券列表信息
          for (var i = 0; i < cardList.length; i++) {
            var cardId = res.cardList[i].cardId;
            var code = res.cardList[i].code
            var ssid = wx.getStorageSync(app.globalData.ssidFlag);
            var postParam = {
              ssid: ssid,
              card_id: cardId,
              code: code
            }
            app.postRequest(getlqUrl, postParam, function (res) {
              if (res.statusCode == 200 && res.data.statusCode == 200) {
              }
            })
          }
        },
        fail: function (res) {
        }
      })
    }
  },

  goDetailsPage: function (e) {
    let lid = e.currentTarget.dataset.lid;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../dish/details/details?menu_lid=' + lid + '&title=' + title,
    })
  },

  addDish: function (e) { //点击添加菜品
    var that = this
    that.animate(e);
    that.addCart(e); //添加购物车
  },

  addCart: function (e) {
    let that = this;
    let cart_menus = app.globalData.shopCart.menu_list;  //获取购物车中的菜品数组 
    let cart_is_exist_menu; //是否有重复添加
    var temp_menus = that.data.menu_list; 
    var addDish = e.currentTarget.dataset;
    addDish.menu_count = 1;


    // 修改购物车商品数据
    for (let i = 0; i < cart_menus.length; i++) {
      if (cart_menus[i].menu_id == addDish.menu_id) {
        cart_menus[i].menu_count = cart_menus[i].menu_count + 1;
        cart_is_exist_menu = true; //是否为重复添加
      }
    }
    if (!cart_is_exist_menu) {
      cart_menus.push(addDish);
    }

    // 修改菜品用户展示库存数据
    that.reactData(temp_menus, addDish.menu_id, 1);

    //购物车缓存菜品金额数据
    app.globalData.shopCart.total_count += 1;
    if (addDish.menu_discount_price) { 
      app.globalData.shopCart.total_fee = app.globalData.shopCart.total_fee + addDish.menu_discount_price + 0; //实价累加
      app.globalData.shopCart.has_dis_count += 1;
    } else {
      app.globalData.shopCart.total_fee = app.globalData.shopCart.total_fee + addDish.menu_price + 0; //实价累加
    }
    app.globalData.shopCart.original_fee = app.globalData.shopCart.original_fee + addDish.menu_price + 0; //原价累加 

    // 购物车模板使用数据
    that.setData({
      shopCart: app.globalData.shopCart,
    })
  },

  reactData: function (temp_menus, menu_id, addSku) {
    let that = this;
    for (let i = 0; i < temp_menus.length; i++) {
      if (temp_menus[i].menu_id == menu_id) {
        if (temp_menus[i].menu_count) {
          temp_menus[i].menu_count = temp_menus[i].menu_count + addSku;
        } else {
          temp_menus[i].menu_count = addSku;
        }
        break;
      }
    }
    that.setData({
      menu_list: temp_menus
    })
  },

  reduceDish: function (e) {
    let that = this;
    let cart_menus = app.globalData.shopCart.menu_list;  //获取购物车中的菜品数组 
    var temp_menus = that.data.menu_list; //temp data 
    var reduceDish = e.currentTarget.dataset;

    var cartMenus = [];
    var menuCountExist = false;
    for (let i = 0; i < cart_menus.length; i++) {
      if (cart_menus[i].menu_id == reduceDish.menu_id) {
        if (cart_menus[i].menu_count >= 1) {
          cart_menus[i].menu_count = cart_menus[i].menu_count - 1;
        }
        if (cart_menus[i].menu_count > 0) {
          menuCountExist = true;
          cartMenus.push(cart_menus[i])
        }
      } else {
        cartMenus.push(cart_menus[i])
      }
    }
    app.globalData.shopCart.menu_list = cartMenus;

    //购物车缓存菜品金额数据
    app.globalData.shopCart.total_count -= 1;
    if (reduceDish.menu_discount_price) { 
      app.globalData.shopCart.total_fee = app.globalData.shopCart.total_fee - reduceDish.menu_discount_price + 0;
      app.globalData.shopCart.has_dis_count -= 1;
    } else {
      app.globalData.shopCart.total_fee = app.globalData.shopCart.total_fee - reduceDish.menu_price + 0;
    }
    app.globalData.shopCart.original_fee = app.globalData.shopCart.original_fee - reduceDish.menu_price + 0;

    for (let i = 0; i < temp_menus.length; i++) {
      if (temp_menus[i].menu_id == reduceDish.menu_id) {
        if (menuCountExist) {
          temp_menus[i].menu_count = temp_menus[i].menu_count - 1;
        } else {
          temp_menus[i].menu_count = null;
        }
      }
    }
    that.setData({
      menu_list: temp_menus,
      shopCart: app.globalData.shopCart,
    })
  },

  goPay: function (e) {
    wx.setStorage({
      key: "order_data",
      data: app.globalData.shopCart,
    })
    wx.navigateTo({
      url: '../pay/pay',
    })
  },

  animate: function (e) { //小球动画
    let that = this;
    //小球动画
    that.setData({
      animateObj: {
        animateX: e.changedTouches[0].clientX * 2, //小球动画坐标
        animateY: e.changedTouches[0].clientY * 2,
        animatePath: true, //小球运动轨迹
      },
    })
    setTimeout(function () {
      that.setData({
        animateObj: {
          animatePath: false
        }
      })
    }, 400)
  },

  shopcart_click: function (e) { // 点击购物车
    let shop_status = this.data.cart_exist_status;
    this.setData({
      cart_exist_status: !shop_status
    })
  },

  mask_layer_click: function (e) {
    this.setData({
      cart_exist_status: false
    })
  }
}) 
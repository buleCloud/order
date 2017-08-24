var app = getApp()//获取应用实例
const getDishDetails = app.globalData.host + "/applet/menu/info/get"; //获取菜品详情
const addlikeEat = app.globalData.host + '/applet/menu/like/eating/add'; //喜欢吃
var menu_lid;
var isrunning = false;
Page({
  data: {
    dishInfo: {},
    isLike: false,
    shopcart: {},
    cart_exist_status : false,
    animateObj: {// 设置对象将其传入到模版页面
      animateX: '', //小球动画坐标
      animateY: '',
      animatePath: false, //小球运动轨迹
    }
  },

  onLoad: function (options) {
    menu_lid = options.menu_lid;
    let title = options.title;
    wx.setNavigationBarTitle({
      title: title
    })
    var that = this;
    var param = {
      menu_lid: menu_lid
    }
    app.getRequest(getDishDetails, param, function (res) {
      if (res.statusCode == 200 && res.data.statusCode == 200) {
        that.setData({
          dishInfo: res.data.data,
          shopCart: app.globalData.shopCart,
        })
      }
    })
  },

  onShow:function(){
    let that = this;
    that.setData({
      shopCart: app.globalData.shopCart
    })
  },

  addDish: function (e) {
    let that = this;
    let cart_menus = app.globalData.shopCart.menu_list;  //获取购物车中的菜品数组 
    let cart_is_exist_menu; //是否有重复添加
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

    //购物车缓存菜品金额数据
    app.globalData.shopCart.total_count += 1;
    if (addDish.menu_discount_price) { //
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
    // 小球动画
    that.animate(e)
  },

  reduceDish: function (e) {
    let that = this;
    let cart_menus = app.globalData.shopCart.menu_list;  //获取购物车中的菜品数组 
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
    if (reduceDish.menu_discount_price) { //
      app.globalData.shopCart.total_fee = app.globalData.shopCart.total_fee - reduceDish.menu_discount_price + 0;
      app.globalData.shopCart.has_dis_count -= 1;
    } else {
      app.globalData.shopCart.total_fee = app.globalData.shopCart.total_fee - reduceDish.menu_price + 0;
    }
    app.globalData.shopCart.original_fee = app.globalData.shopCart.original_fee - reduceDish.menu_price + 0;

    that.setData({
      shopCart: app.globalData.shopCart,
    })
  },  

  likeEat: function (e) {
    var that = this;
    that.setData({
      isLike: true
    })

    let param = {
      menu_lid: menu_lid
    }
    app.getRequest(addlikeEat, param, function (res) {
      if (res.statusCode == 200 && res.data.statusCode == 200) {
      }
    })
  },

  goPay: function (e) {
    wx.setStorage({
      key: "order_data",
      data: app.globalData.shopCart,
    })
    wx.navigateTo({
      url: '../../pay/pay',
    })
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
    }, 700)
  },   
})
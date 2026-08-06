// 华为商城小程序后台 - Cloudflare Workers 版本
// 部署后：你的域名 + /api/xxx 提供接口，/images/xxx 提供图片
// 修改内容：编辑 data.js 后重新部署即可

import { bannerList, categoryList, homeGoods, users } from './data.js';

// 响应工具：统一返回 {code:'0000', message:'请求成功', data:...} 格式
function ok(data) {
  return new Response(JSON.stringify({ code: '0000', message: '请求成功', data: data }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}

function fail(code, msg) {
  return new Response(JSON.stringify({ code: code, message: msg, data: msg }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}

// 读取 GET 请求参数
function getParams(url) {
  return Object.fromEntries(url.searchParams.entries());
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ---------- API 路由 ----------
    // 1. 轮播图列表
    if (path === '/api/banner/getBannerList') {
      return ok(bannerList);
    }

    // 2. 首页商品列表（rmjs 精选 / cxsj 促销 / mssk 秒杀）
    if (path === '/api/goods/getHomeGoodsList') {
      return ok(homeGoods);
    }

    // 3. 商品分类列表
    if (path === '/api/category/getCategoryList') {
      return ok(categoryList);
    }

    // 4. 获取短信验证码（教学演示：随机6位数字，明文返回）
    if (path === '/api/user/getVerifyCode') {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      return ok(code);
    }

    // 5. 用户注册
    if (path === '/api/user/register') {
      const p = getParams(url);
      if (!p.loginName || !p.loginPassword) return fail('0001', '用户名或密码不能为空');
      if (users.find(u => u.loginName === p.loginName)) return fail('0002', '用户名已存在');
      users.push({
        id: users.length + 1,
        userId: 'u' + String(users.length + 1).padStart(3, '0'),
        loginName: p.loginName,
        mobile: p.mobile || '',
        password: p.loginPassword,
        nickName: p.nickName || p.loginName
      });
      return ok({ id: users[users.length - 1].id });
    }

    // 6. 用户登录（简化版：不调微信接口，直接查用户表返回 token）
    if (path === '/api/user/swxLogin') {
      const p = getParams(url);
      const user = users.find(u => u.loginName === p.loginName && u.password === p.loginPassword);
      if (!user) return fail('0003', '用户名或密码错误');
      return ok({
        swx_session: 'session-' + Date.now(),
        openId: 'openid-' + user.userId,
        token: 'token-' + Date.now(),
        user: {
          userId: user.userId,
          id: user.id,
          nickName: user.nickName,
          mobile: user.mobile
        }
      });
    }

    // ---------- 静态图片（/images/xxx） ----------
    // 方式1：使用 Cloudflare Assets（推荐，图片放在 assets/images 目录）
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // 方式2：从本地路径读取（未配置 Assets 时返回提示）
    return new Response('Not Found: ' + path, { status: 404 });
  }
};

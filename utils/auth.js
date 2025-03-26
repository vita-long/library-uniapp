import { http } from "./request";
import { getHeader } from './tools';

// utils/auth.js
const LOGIN_TOKEN_KEY = 'login_token'
const CSRF_TOKEN_KEY = 'csrf_token'

export const auth = {
  // 用户登录
  async login(username, password) {
    try {
      const res = await http({
        url: 'http://localhost:4000/user/login',
        method: 'POST',
        data: { username, password }
      });

      const cookies = res.header['Set-cookie'];
      const xsrfToken = getHeader(cookies, 'XSRF-TOKEN')
      if (res.data.code === 0) {
        this.setTokens({
          loginToken: res.data.data.token,
          csrfToken: xsrfToken
        })
        return true;
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none' })
        return false;
      }
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  },

  // Token 存储
  setTokens({ loginToken, csrfToken }) {
    try {
      wx.setStorageSync(LOGIN_TOKEN_KEY, loginToken)
      wx.setStorageSync(CSRF_TOKEN_KEY, csrfToken)
    } catch (e) {
      console.error('存储 Token 失败:', e)
    }
  },

  // Token 获取
  getTokens() {
    return {
      loginToken: wx.getStorageSync(LOGIN_TOKEN_KEY),
      csrfToken: wx.getStorageSync(CSRF_TOKEN_KEY)
    }
  },

  // 清除 Token
  clearTokens() {
    wx.removeStorageSync(LOGIN_TOKEN_KEY)
    wx.removeStorageSync(CSRF_TOKEN_KEY)
  },

  // 检查登录状态
  isLoggedIn() {
    return !!this.getTokens().loginToken;
  }
}
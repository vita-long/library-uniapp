// utils/auth.js
const LOGIN_TOKEN_KEY = 'login_token'
const CSRF_TOKEN_KEY = 'csrf_token'

export const auth = {
  // 用户登录
  async login(username, password) {
    try {
      await wx.request({
        url: 'http://localhost:4000/user/login',
        method: 'POST',
        data: { username, password },
        success(res) {
          if (res.data.code === 0) {
            this.setTokens({
              loginToken: res.data.data.token
            })
            return true;
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' })
            return false;
          }
        }
      })
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  },

  // Token 存储（加密处理）
  setTokens({ loginToken, csrfToken }) {
    try {
      wx.setStorageSync(LOGIN_TOKEN_KEY, this.encryptToken(loginToken))
      wx.setStorageSync(CSRF_TOKEN_KEY, this.encryptToken(csrfToken))
    } catch (e) {
      console.error('存储 Token 失败:', e)
    }
  },

  // Token 获取（解密处理）
  getTokens() {
    return {
      loginToken: this.decryptToken(wx.getStorageSync(LOGIN_TOKEN_KEY)),
      csrfToken: this.decryptToken(wx.getStorageSync(CSRF_TOKEN_KEY))
    }
  },

  // 简单加密示例（生产环境应使用更安全的方式）
  encryptToken(token) {
    return wx.getStorageSync('crypto_key') 
      ? CryptoJS.AES.encrypt(token, wx.getStorageSync('crypto_key')).toString()
      : token
  },

  decryptToken(encryptedToken) {
    return wx.getStorageSync('crypto_key')
      ? CryptoJS.AES.decrypt(encryptedToken, wx.getStorageSync('crypto_key')).toString(CryptoJS.enc.Utf8)
      : encryptedToken
  },

  // 清除 Token
  clearTokens() {
    wx.removeStorageSync(LOGIN_TOKEN_KEY)
    wx.removeStorageSync(CSRF_TOKEN_KEY)
  },

  // 检查登录状态
  isLoggedIn() {
    return !!this.getTokens().loginToken
  }
}
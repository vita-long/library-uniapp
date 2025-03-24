// pages/login/login.js
import { auth } from '../../utils/auth'

Page({
  data: {
    loading: false
  },

  async onSubmit(e) {
    const { username, password } = e.detail.value
    if (!this.validateInput(username, password)) return

    this.setData({ loading: true })
    
    try {
      const success = await auth.login(username, password)
      if (success) {
        // wx.reLaunch({ url: '/pages/index/index' })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  validateInput(username, password) {
    if (!username || username.length < 4) {
      wx.showToast({ title: '用户名需至少4位', icon: 'none' })
      return false
    }
    
    if (!password || password.length < 6) {
      wx.showToast({ title: '密码需至少6位', icon: 'none' })
      return false
    }
    
    return true
  }
})
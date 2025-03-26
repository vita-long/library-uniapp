// utils/request.js
import { auth } from './auth'

const createRequest = () => {
  // 请求计数器（避免并发请求多次跳转登录页）
  let pendingRequestCount = 0

  return (options) => {
    pendingRequestCount++
    
    return new Promise((resolve, reject) => {
      const { loginToken, csrfToken } = auth.getTokens()
      
      wx.request({
        ...options,
        header: { 
          'authorization': `Bearer ${loginToken}`,
          'X-XSRF-TOKEN': csrfToken,
          withCredentials: true,
          ...options.header
        },
        success: (res) => {
          // 处理 Token 过期
          if (res.statusCode === 401 && pendingRequestCount === 1) {
            auth.clearTokens();
            wx.reLaunch({ url: '/pages/login/login' })
            resolve(res)
          }
          resolve(res)
        },
        fail: reject,
        complete: () => pendingRequestCount--
      })
    })
  }
}

export const http = createRequest()
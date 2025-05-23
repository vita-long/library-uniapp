import { DOMAIN_URL } from "../../constants/index";
import { http } from "../../utils/request"

Page({
  data: {
    book: {
      bookName: '',
      author: '',
      cover: ''
    },
    isNew: true
  },

  onLoad(options) {
    if (options.id) { // 编辑现有书籍
      this.setData({ isNew: false })
      this.loadBookDetail(options.id)
    }
  },

  // 加载书籍详情
  async loadBookDetail(id) {
    try {
      const res = await http({
        url: `${DOMAIN_URL}/books/${id}`
      })
      this.setData({ book: res.data })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 选择封面图片
  chooseCover() {
    wx.chooseImage({
      count: 1,
      success: res => {
        this.uploadImage(res.tempFilePaths[0])
      }
    })
  },

  // 上传图片到服务器
  async uploadImage(filePath) {
    wx.showLoading({ title: '上传中...' })
    
    try {
      const res = await wx.pro.uploadFile({
        url: '/api/upload',
        filePath,
        name: 'file'
      })
      
      this.setData({
        'book.cover': JSON.parse(res.data).url
      })
    } catch (error) {
      wx.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // 提交表单
  async onSubmit(e) {
    const formData = e.detail.value
    const { book, isNew } = this.data

    const payload = {
      ...formData
    }

    console.log(payload);

    try {
      if (isNew) {
        await http({
          url: `${DOMAIN_URL}/books`,
          method: 'POST',
          data: payload
        })
      } else {
        await http({
          url: `${DOMAIN_URL}/books/${book.id}`,
          method: 'PUT',
          data: payload
        })
      }

      wx.navigateBack()
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
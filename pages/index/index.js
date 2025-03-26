import { http } from "../../utils/request"
import { DOMAIN_URL } from '../../constants/index';

Page({
  data: {
    books: [],
    searchText: '',
    selectedBooks: [],
    currentPage: 1,
    pageSize: 10,
    total: 0,
    isLoading: false,
    noMoreData: false,
    scrollHeight: 300
  },

  onLoad() {
    this.calculateScrollHeight()
    this.loadBooks()
  },

  onAddBook() {
    wx.navigateTo({
      url: '/pages/edit/edit' // 跳转到编辑页，不传id表示新增
    })
  },

  // 当从编辑页返回时刷新列表
  onShow() {
    this.loadBooks(true) // 强制刷新
  },

  // 计算滚动区域高度
  calculateScrollHeight() {
    const sysInfo = wx.getWindowInfo()
    const query = wx.createSelectorQuery()
    query.select('.search-bar').boundingClientRect()
    query.select('.toolbar').boundingClientRect()
    query.exec(res => {
      const height = sysInfo.windowHeight - res[0].height - res[1].height - 20
      this.setData({ scrollHeight: height })
    })
  },

  // 加载书籍数据
  async loadBooks() {
    if (this.data.isLoading || this.data.noMoreData) return

    this.setData({ isLoading: true })
    try {
      const res = await http({
        url: `${DOMAIN_URL}/books`,
        method: 'GET', 
        data: {
          current: this.data.currentPage,
          pageSize: this.data.pageSize,
          search: this.data.searchText
        }
      })

      const result = res.data;
      if (result.code === 0) {
        this.setData({
          books: [...this.data.books, ...result.data.list],
          total: result.data.total,
          currentPage: this.data.currentPage + 1,
          noMoreData: this.data.books.length >= res.data.total
        })
      }
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 搜索输入处理
  onSearchInput: debounce(function(e) {
    this.setData({
      searchText: e.detail.value,
      books: [],
      currentPage: 1,
      noMoreData: false
    })
    this.loadBooks()
  }, 500),

  // 复选框切换
  toggleCheck(e) {
    const id = e.currentTarget.dataset.id
    const books = this.data.books.map(book => 
      book.id === id ? {...book, checked: !book.checked} : book
    )
    this.setData({
      books,
      selectedBooks: books.filter(book => book.checked).map(book => book.id)
    })
  },

  // 批量删除
  async onBatchDelete() {
    const res = await wx.showModal({
      title: '确认删除',
      content: `确定删除选中的${this.data.selectedBooks.length}本书籍吗？`
    })

    if (res.confirm) {
      try {
        await http({
          url: `${DOMAIN_URL}/books`,
          method: 'DELETE',
          data: { ids: this.data.selectedBooks }
        })
        
        this.setData({
          books: this.data.books.filter(book => !book.checked),
          selectedBooks: []
        })
      } catch (error) {
        wx.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  },

  async onDeleteBook(e) {
    const book = e.currentTarget.dataset
    const res = await wx.showModal({
      title: '确认删除',
      content: `确定删除名称为【${book.name}】的书籍吗？`
    })

    if (res.confirm) {
      try {
        await http({
          url: `${DOMAIN_URL}/books/${book.id}`,
          method: 'DELETE'
        })
        
        this.setData({
          books: this.data.books.filter(bk => bk.id !== book.id)
        })
      } catch (error) {
        wx.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  },

  // 跳转编辑页
  onEditBook(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` })
  },

  // 加载更多
  loadMore() {
    if (!this.data.noMoreData) this.loadBooks()
  }
})

// 防抖函数
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
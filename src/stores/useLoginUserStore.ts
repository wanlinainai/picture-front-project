import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 存储登录用户的信息状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  // 用户的初始化变量
  const loginUser = ref<any>({
    userName: '未登录',
  })

  async function fetchLoginUser() {
    // const res = await getCurrentUser();
    // if (res.data.code === 0 && res.data.data) {
    //   loginUser.value = res.data.data
    // }

    // 测试用户
    setTimeout(() => {
      loginUser.value = {userName: "测试用户", id: 1}
    }, 1000)
  }

  /**
   * 设置登录用户
   */
  function setLoginUser(newLoginUser: any) {}

  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})

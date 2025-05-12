<template>
  <div id="mySpacePage">
    <p>正在跳转，请稍后....</p>
  </div>
</template>

<script setup lang="ts">
// 业务流程

import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'

/*
  用户未登录，直接跳转到登录页面
  用户已经登录，获取该用户已经创建的空间
    如果有，则进入到第一个空间
    没有，则进入到空间创建页面
*/
const router = useRouter()

const loginUserStore = useLoginUserStore()

// 检查用户是否有个人空间
const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }

  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
  })
  if (res.data.code === 0) {
    if(res.data.data?.records?.length > 0) {
      const space = res.data.data.records[0]
      router.replace(`/space/${space.id}`)
    } else {
      router.replace('/add_space')
      message.warn('请先创建空间')
    }
  } else {
    message.error('加载我的空间失败,' + res.data.message)
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>

<style>
#mySpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>

<template>
  <div id="addspacePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改空间' : '创建空间' }}</h2>
    <!--    空间信息表单-->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear></a-input>
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select v-model:value="formData.spaceLevel" :options="SPACE_LEVEL_OPTIONS" placeholder="请输入空间级别"
          style="min-width: 180px;" allow-clear>
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">提交</a-button>
      </a-form-item>
    </a-form>

    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅仅支持开通普通版，如需升级空间，请联系
        <a href="https://www.baidu.com" target="_blank">张德彪</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}：大小 {{ formatSize(spaceLevel.maxSize) }}，数量 {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { addSpaceUsingPost, getSpaceByIdUsingGet, listSpaceLevelUsingGet, updateSpaceUsingPost } from '@/api/spaceController'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { formatSize } from '@/utils'

const space = ref<API.Space>()

const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON
})
const router = useRouter();
// 加载状态
const loading = ref(false)
const oldSpace = ref<API.SpaceVO>()
const spaceLevelList = ref<API.SpaceLevel[]>()

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('加载空间级别失败:' + res.data.message)
  }
}

// 提交表单
const handleSubmit = async (values: any) => {
  const spaceId = oldSpace.value?.id
  loading.value = true
  let res;
  // 更新
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...formData
    })
  } else {
    res = await addSpaceUsingPost({
      ...formData
    })
  }

  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    // 跳转到空间详情页
    router.push({
      path: `/space/${spaceId ?? res.data.data}`,
    })
  } else {
    message.error('操作失败:' + res.data.message);
  }
  loading.value = false
}

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
const route = useRoute()

// 获取老数据
const getOldspace = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    const res = await getSpaceByIdUsingGet({
      id: id
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      oldSpace.value = data
      formData.spaceName = data.spaceName
      formData.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  fetchSpaceLevelList()
  getOldspace()
})

</script>

<style>
#addspacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>

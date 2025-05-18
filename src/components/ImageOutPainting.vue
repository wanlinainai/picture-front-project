<template>
  <a-modal
    class="image-out-painting"
    v-model:visible="visible"
    title="AI扩图"
    :footer="false"
    @cancel="closeModal"
  >
    <!--显示原图和扩图，左右显示，使用栅格布局-->
    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
      </a-col>
    </a-row>
    <div style="margin-bottom: 16px" />
    <a-flex justify="center" gap="16">
      <a-button type="primary" ghost @click="createTask" :loading="!!taskId">生成图片</a-button>
      <a-button v-if="resultImageUrl" type="primary" @click="handleUpload" :loading="uploadLoading"
        >应用结果</a-button
      >
    </a-flex>
  </a-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  createOutPaintingTaskResponseBaseResponseUsingPost,
  getOutPaintingTaskResponseBaseResponseUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: number
}

const props = defineProps<Props>()
const visible = ref(false)
const resultImageUrl = ref<string>('')
const taskId = ref<string>('')
// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

const uploadLoading = ref(false)

/**
 * 上传文件
 * @param file
 */
const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: resultImageUrl.value }
    params.spaceId = props.spaceId
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('上传成功')
      // 上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      closeModal()
    } else {
      message.error('上传失败' + res.data.message)
    }
  } catch (error) {
    message.error('上传失败' + error)
  } finally {
    uploadLoading.value = false
  }
}

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createOutPaintingTaskResponseBaseResponseUsingPost({
    pictureId: props.picture.id,
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出页面')
    console.log(res.data.data.output.taskId)
    taskId.value = res.data.data.output.taskId

    // 轮询
    startPolling()
  } else {
    message.error('图片上传失败，' + res.data.message)
  }
}

let pollingTimer: NodeJS.Timeout = null
/**
 * 开启轮询
 */
const startPolling = () => {
  pollingTimer = setInterval(async () => {
    try {
      if (!taskId.value) {
        return
      }
      const res = await getOutPaintingTaskResponseBaseResponseUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        console.log('输出taskResult:', taskResult)
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult?.outputImageUrl
          // 清理轮询
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败')
          // 清理轮询
          clearPolling()
        }
      }
    } catch (error) {
      console.log('扩图任务轮询失败:', error)
      message.error('扩图任务轮询失败', error.message)
      // 清理轮询
      clearPolling()
    }
  }, 3000)
}

/**
 * 清理轮询
 */
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

defineExpose({
  openModal,
})
</script>
<style scoped>
.image-out-painting {
  text-align: center;
}
</style>

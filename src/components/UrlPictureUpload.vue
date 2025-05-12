<template>
  <div id="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px;">
      <a-input v-model:value="fileurl" style="width: calc(100% - 120px)" placeholder="请输入图片链接" />
      <a-button type="primary" :loading="loading" @click="handleUpload" style="width: 120px;">提交</a-button>
    </a-input-group>
    <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

const loading = ref<boolean>(false)
const imageUrl = ref<string>('')
const fileurl = ref<string>('')

/**
 * 上传文件
 * @param file
 */
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileurl.value }
    params.spaceId  = props.spaceId
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('上传成功')
      // 上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('上传失败' + res.data.message)
    }
  } catch (error) {
    message.error('上传失败' + error)
  } finally {
    loading.value = false
  }
}
</script>
<!--加上:deep就可以强行控制修改文件样式-->
<style scoped>
#url-picture-upload {
  width: 100%;
  height: 100%;
  min-width: 152px;
  min-height: 152px;
}

#url-picture-upload img {
  max-width: 100%;
  max-height: 480px;
  margin-bottom: 16px;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>

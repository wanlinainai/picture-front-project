<template>
  <a-modal class="image-cropper" v-model:visible="visible" title="编辑图片" :footer="false" @cancel="closeModal">
    <vue-cropper
      ref="cropperRef"
      :img="imgUrl"
      output-type="png"
      :info="true"
      :can-move="false"
      :can-move-box="true"
      :fixed-box="false"
      :auto-crop="true"
      :center-box="true"
    />
    <div style="margin-bottom: 16px"></div>
    <!--  图片操作-->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft">向左旋转</a-button>
        <a-button @click="rotateRight" class="btn">向右旋转</a-button>
        <a-button @click="changeScale(1)" class="btn">放大</a-button>
        <a-button @click="changeScale(-1)" class="btn">减少</a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { message } from 'ant-design-vue'
  import { uploadPictureUsingPost } from '@/api/pictureController.ts'

  interface Props {
    imgUrl?: string
    picture?: API.PictureVO
    spaceId?: number
    onSuccess?: (newPicture: API.PictureVO) => void
  }
  const props = defineProps<Props>()
  const cropperRef = ref();
  const visible = ref(false)
  // 打开弹窗
  const openModal = () => {
    visible.value = true
  }

  // 关闭弹窗
  const closeModal = () => {
    visible.value = false
  }

  // 向左旋转
  const rotateLeft = () => {
    cropperRef.value.rotateLeft()
  }
  // 向右旋转
  const rotateRight = () => {
    cropperRef.value.rotateRight()
  }
  // 缩放
  const changeScale = (num: number) => {
    cropperRef.value.changeScale(num)
  }

  const loading = ref(false)
  // 确认裁切
  const handleConfirm = () => {
    cropperRef.value.getCropBlob((blob: Blob) => {
      // blob为已裁切的文件
      const fileName = (props.picture?.name || 'image') + '.png'
      const file = new File([blob], fileName, {type: blob.type})
      // 上传图片
      handleUpload({file})
    })
  }

  /**
   * 上传文件
   * @param file
   */
  const handleUpload = async ({ file }: any) => {
    loading.value = true
    try {
      const params : API.PictureUploadRequest= props.picture ? {id: props.picture.id} : {}
      params.spaceId = props.spaceId
      const res = await uploadPictureUsingPost(params, {}, file)
      if (res.data.code === 0 && res.data.data) {
        message.success('上传成功')
        // 上传成功的图片信息传递给父组件
        props.onSuccess?.(res.data.data)
        // 关闭
        closeModal()
      } else {
        message.error('上传失败' + res.data.message)
      }
    } catch (error) {
      console.error("图片上传失败" + error)
      message.error('上传失败' + error)
    }

    loading.value = false
  }

  defineExpose({
    openModal
  })
</script>
<style scoped>
.image-cropper {
  text-align: center;
}
.image-cropper .vue-cropper {
  height: 400px;
}
.image-cropper-actions {
  text-align: center;
}
</style>

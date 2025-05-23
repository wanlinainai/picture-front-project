<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!--      图片预览-->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <div style="display: flex; justify-content: center">
            <a-image :src="picture.url" style="max-height: 600px; object-fit: contain"></a-image>
          </div>
        </a-card>
      </a-col>
      <!--      图片编辑-->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
            <a-descriptions-item label="主色调">
              <a-space>
                {{picture.picColor ?? '-'}}
                <div v-if="picture.picColor"
                :style="{
                  backgroundColor: toHexColor(picture.picColor),
                  width: '16px',
                  height: '16px',
                }">
                </div>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>

          <!--          图片操作-->
          <a-space>
            <a-button v-if="canEdit" type="default" @click="doEdit"
              >编辑
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>

            <a-button type="primary" ghost @click="doShare"
            >分享
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>

            <a-button v-if="canEdit" danger @click="doDelete"
              >删除
              <template #icon>
                <DeleteOutlined />
              </template>
            </a-button>

            <a-button type="default" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
  <ShareModal ref="shareModalRef" :link="shareLink"/>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  getPictureByIdUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { downloadImage, formatSize } from '@/utils'
import { DeleteOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useRouter } from 'vue-router'
import { toHexColor } from '@/constants/picture.ts'
import ShareModal from '@/components/ShareModal.vue'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败:' + res.data.message)
    }
  } catch (error) {
    message.error('获取图片详情失败:' + error.message)
  }
}

// 得到登录用户
const loginUserStore = useLoginUserStore()
// 是否可以编辑
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser

  // 未登录不能编辑
  if (!loginUser.id) {
    return false
  }
  // 仅仅本人或者管理员可以编辑
  const user = picture.value.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})

const router = useRouter()
// 编辑图片
const doEdit = () => {
  // 添加spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId
    }
  })
}

// 删除图片
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
}

// 本地下载
const doDownload = () => {
  downloadImage(picture.value.url)
}

onMounted(() => {
  fetchPictureDetail()
})

/**
 * 分享
 */
const shareModalRef = ref()
const shareLink = ref<string>()
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  if (shareModalRef.value){
    shareModalRef.value.openModal()
  }
}
</script>

<style>
#pictureDetailPage {
  margin-bottom: 16px;
}
</style>

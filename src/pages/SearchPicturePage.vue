<template>
  <div id="searchPicturePage">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <h3 style="margin: 16px 0">原图</h3>
    <a-card style="width: 240px">
      <template #cover>
        <img
          style="height: 180px; object-fit: cover"
          :alt="picture.name"
          :src="picture.thumbnailUrl ?? picture.url"/>
      </template>
    </a-card>
    <h3 style="margin: 16px 0">识图结果</h3>
<!--    图片列表-->
    <a-list :grid="{gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6}"
    :data-source="dataList"
    :loading = "loading">
      <template #renderItem="{item}">
        <a-list-item style="padding: 0">
          <a :href="item.fromUrl" target="_self">
            <a-card>
              <template #cover>
                <img :src="item.thumbUrl" style="height: 180px; object-fit: cover ">
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { getPictureByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'

const picture = ref<API.PictureVO>({})
const route = useRoute()
// 图片id
const pictureId = computed(() => {
  return route.query?.pictureId
})

const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(false)

// 获取搜图结果
const fetchData = async () => {
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({pictureId: pictureId.value})
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败', res.data.message)
    }
  } catch (error) {
    message.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted( () => {
   fetchData()
})
const getOldPicture = async () => {
  // 获取数据
  const id = route.query?.pictureId;
  if (id) {
    const res = await getPictureByIdUsingGet({ id: id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
    }
  }
}

onMounted( () => {
   getOldPicture()
})
</script>

<style>
#searchPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>

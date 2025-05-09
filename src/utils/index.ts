import { saveAs } from 'file-saver'

/**
 * 格式化文件大小
 */
export const formatSize = (size?: number) => {
  if (!size) return '未知';
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB';
  if (size < 1024 * 1024 * 1024 * 1024) return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  return (size / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB';
};


/**
 * 下载图片
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}

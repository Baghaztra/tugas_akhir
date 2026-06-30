<template>
  <ClientOnly>
    <VueEasyLightbox
      :visible="visible"
      :imgs="images"
      :index="currentIndex"
      :zoom-scale="0.2"
      :max-zoom="5"
      :swipe-tolerance="30"
      @hide="onHide"
      @on-index-change="onIndexChange"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  images: string[]
  initialIndex?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const currentIndex = ref(props.initialIndex ?? 0)

watch(() => props.initialIndex, (val) => {
  if (val != null) currentIndex.value = val
})

watch(() => props.visible, (val) => {
  if (val && props.initialIndex != null) {
    currentIndex.value = props.initialIndex
  }
})

const onIndexChange = ({ index }: { index: number }) => {
  currentIndex.value = index
}

const onHide = () => {
  emit('close')
}
</script>

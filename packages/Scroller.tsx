import {
  defineComponent,
  ref,
  unref,
  computed,
  onMounted,
  onBeforeUnmount,
  provide,
  h
} from 'vue'
import { useResizeObserver, useEventListener } from '@vueuse/core'
import Scrollbar from './Scrollbar'
import getScrollbarWidth from '../utils/scrollbarWidth'
import is from '../utils/is'
import props from './scrollerProps'
import './style.css'

export default defineComponent({
  name: 'ZpScroller',
  components: {
    Scrollbar
  },
  props,
  emits: ['scroll', 'update'],
  setup (props, { emit, slots, expose }) {
    let stopResizeObserver: (() => void) | undefined = undefined
    let stopResizeListener: (() => void) | undefined = undefined
    const width = ref('')
    const height = ref('')
    const offsetX = ref(0)
    const offsetY = ref(0)
    const overflowX = ref(false)
    const overflowY = ref(false)
    const elRef = ref<HTMLElement | null>(null)
    const wrapRef = ref<HTMLElement | null>(null)
    const scrollContentRef = ref<HTMLElement | null>(null)
    const wrapStyle = computed(() => {
      const style: StyleValue = {}
      const scrollBarWidth = getScrollbarWidth()

      if (scrollBarWidth) {
        style.marginRight = style.marginBottom = `-${scrollBarWidth}px`
        style.height = `calc(100% + ${scrollBarWidth}px)`
      }
      !style.height && (style.height = '100%')
      return style
    })
    const handleScroll = (evt: MouseEvent) => {
      const wrapRefValue = unref(wrapRef)

      if (!wrapRefValue) {
        return
      }

      offsetX.value = wrapRefValue.scrollLeft * 100 / wrapRefValue.clientWidth
      offsetY.value = wrapRefValue.scrollTop * 100 / wrapRefValue.clientHeight
      emit('scroll', evt)
    }
    const updateScrollbar = () => {
      const wrapRefValue = unref(wrapRef)

      if (!wrapRefValue) {
        return
      }

      overflowX.value = wrapRefValue.scrollWidth > wrapRefValue.offsetWidth
      overflowY.value = wrapRefValue.scrollHeight > wrapRefValue.offsetHeight
      width.value = `${wrapRefValue.clientWidth * 100 / wrapRefValue.scrollWidth}%`
      height.value = `${wrapRefValue.clientHeight * 100 / wrapRefValue.scrollHeight}%`
      emit('update')
    }
    const scrollTo = (to: string | number, delay = 0) => {
      setTimeout(() => {
        if (!wrapRef.value) {
          return
        }
        if (is.string(to)) {
          const selectedItem: HTMLElement | null = wrapRef.value.querySelector(to)

          if (selectedItem) {
            wrapRef.value.scrollTop = selectedItem.offsetTop
          }
          return
        }
        wrapRef.value.scrollTop = to
      }, delay)
    }

    expose({
      $el: elRef,
      scrollTo,
      updateScrollbar
    })

    provide('ZpScroller', { wrapRef })

    onMounted(() => {
      if (!props.noresize && scrollContentRef) {
        ({ stop: stopResizeObserver } = useResizeObserver(scrollContentRef, updateScrollbar))
        stopResizeListener = useEventListener('resize', updateScrollbar)
      }
    })

    onBeforeUnmount(() => {
      stopResizeObserver?.()
      stopResizeListener?.()
    })

    return () => (
      <div class={['zp-scroller', props.customClass]}
        ref={elRef}>
        {props.nativeBar ? slots?.default?.() :
          <div class="zp-scroller__container"
            style={wrapStyle.value}
            onScroll={handleScroll}
            ref={wrapRef}>
            {h(props.tag, {
              class: 'zp-scroller__content',
              ref: scrollContentRef
            }, [slots?.default?.() ?? null])}
          </div>}
        <scrollbar v-show={overflowX.value}
          size={width.value}
          offset={offsetX.value}
          direction="h" />
        <scrollbar v-show={overflowY.value}
          size={height.value}
          offset={offsetY.value} />
      </div>
    )
  }
})

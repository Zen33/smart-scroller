import {
  defineComponent,
  ref,
  unref,
  computed,
  inject
} from 'vue'
import { h, v } from './constant'
import props from './scrollbarProps'
import { ZpScrollerInjectScope } from './type'

export default defineComponent({
  name: 'ZpScrollbar',
  props,
  setup (props) {
    const parent = inject<ZpScrollerInjectScope>('ZpScroller')!
    const indicatorRef = ref<HTMLElement | null>(null)
    const scrollbarRef = ref<HTMLElement | null>(null)
    const axis = ref(0)
    const scrollerSchema = computed(() => (props.direction === 'h' ? h : v))
    const indicatorStyle = computed(() => {
      const style: StyleValue = {}
      const translate = `${scrollerSchema.value.translate}(${Math.ceil(props.offset)}%)`

      style[scrollerSchema.value.size] = props.size
      style.transform = translate
      return style
    })
    const isScrolling = ref(false)
    const handleScrollbarClick = (evt: MouseEvent) => {
      const scroller = parent.wrapRef

      if (!indicatorRef.value || !scrollbarRef.value || !scroller) {
        return
      }
      const target = evt.target as HTMLElement
      const scrollerValue = unref(scroller)
      const scrollerSchemaValue = unref(scrollerSchema)
      const offset = Math.abs(target.getBoundingClientRect()[scrollerSchemaValue.direction] - evt[scrollerSchemaValue.client])
      const indicatorStep = (offset - indicatorRef.value[scrollerSchemaValue.offset] / 2) / scrollbarRef.value[scrollerSchemaValue.offset]

      scrollerValue[scrollerSchemaValue.scroll] = indicatorStep * scrollerValue[scrollerSchemaValue.scrollSize]
    }
    const handleIndicatorClick = (evt: MouseEvent) => {
      evt.stopPropagation()
      const target = evt.currentTarget as HTMLElement
      const scrollerSchemaValue = unref(scrollerSchema)

      isScrolling.value = true
      axis.value = target[scrollerSchemaValue.offset] - evt[scrollerSchemaValue.client] + target.getBoundingClientRect()[scrollerSchemaValue.direction]
      document.body.classList.add('is-scrolling')
      document.addEventListener('mousemove', handleIndicatorStartMove)
      document.addEventListener('mouseup', handleIndicatorEndMove)
    }
    const setIndicator = (evt: MouseEvent) => {
      const scroller = parent.wrapRef

      if (!indicatorRef.value || !scrollbarRef.value || !scroller) {
        return
      }
      const scrollerValue = unref(scroller)
      const scrollerSchemaValue = unref(scrollerSchema)

      if (axis.value && isScrolling.value) {
        const offset = evt[scrollerSchemaValue.client] - scrollbarRef.value.getBoundingClientRect()[scrollerSchemaValue.direction]
        const indicatorStep = (offset - (indicatorRef.value[scrollerSchemaValue.offset] - axis.value)) / scrollbarRef.value[scrollerSchemaValue.offset]

        scrollerValue[scrollerSchemaValue.scroll] = indicatorStep * scrollerValue[scrollerSchemaValue.scrollSize]
      }
    }
    const handleIndicatorStartMove = (evt: MouseEvent) => {
      isScrolling.value && setIndicator(evt)
    }
    const handleIndicatorEndMove = () => {
      isScrolling.value = false
      axis.value = 0
      document.body.classList.remove('is-scrolling')
      document.removeEventListener('mousemove', handleIndicatorStartMove)
      document.removeEventListener('mouseup', handleIndicatorEndMove)
    }

    return () => (
      <div class={['zp-scrollbar', `zp-scrollbar__${props.direction}`]}
        onMousedown={handleScrollbarClick}
        ref={scrollbarRef}>
        <div class="zp-scrollbar__indicator"
          onMousedown={handleIndicatorClick}
          style={indicatorStyle.value}
          ref={indicatorRef} />
      </div>
    )
  }
})

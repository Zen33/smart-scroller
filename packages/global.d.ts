declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare type StyleValue =
  | string
  | import('vue').CSSProperties
  | Array<StyleValue>

declare type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends {
    required: true
  }
    ? K
    : never
}[keyof T]

declare type ExtractPropTypesOut<O> = Partial<
  Omit<import('vue').ExtractPropTypes<O>, RequiredKeys<O>>
> &
  Required<
    Omit<import('vue').ExtractPropTypes<O>, Exclude<keyof O, RequiredKeys<O>>>
  >

interface StyleProps {
  [key: string]: number | string
}

declare interface ComputedElement extends HTMLElement {
  currentStyle?: StyleProps
}

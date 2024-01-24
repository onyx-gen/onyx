export interface GroupedComponentCollection {
  [key: string]: {
    component: ComponentNode
    props: { [key: string]: string }
  }[]
}

export interface ComponentProps {
  [key: string]: string
}

export interface ComponentPropsWithState extends ComponentProps {
  state: string
}

export type ComponentCollection<T extends ComponentProps = ComponentProps> = {
  component: ComponentNode
  props: T
}[]

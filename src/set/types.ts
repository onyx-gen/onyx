export interface GroupedComponentCollection<T extends ComponentProps> {
  [key: string]: {
    component: ComponentNode
    props: T
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

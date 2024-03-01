<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import { CheckIcon } from '@heroicons/vue/20/solid'

const { options } = defineProps<{
  options: SelectOption[]
}>()

export interface SelectOption {
  value: string
  label: string
}

const model = defineModel<string>()
</script>

<template>
  <Listbox v-model="model">
    <div class="relative mt-1">
      <ListboxButton
        class="
          relative
          cursor-default
          rounded-sm
          flex items-center gap-1
          py-1
          px-2
          -ml-2
          text-left
          focus:outline-none
          border border-1 border-transparent
          hover:border-color-$figma-color-border
        "
      >
        <span class="inline-block truncate color-$figma-color-text my-font">{{ options.find(option => option.value === model)?.label }}</span>
        <span
          class="pointer-events-none flex items-center"
        >
          <i class="i-onyx-chevron-down h-2 w-2 color-$figma-color-icon" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="z-50 absolute mt-1 max-h-60 overflow-auto rounded-sm bg-[rgb(30,30,30)] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="option in options"
            v-slot="{ active, selected }"
            :key="option.value"
            :value="option.value"
            as="template"
          >
            <li
              class="relative cursor-default select-none pl-7 pr-3 py-0.5"
              :class="{
                'bg-$figma-color-bg-success': active,
              }"
            >
              <span class="block truncate my-font color-$figma-color-text-oncomponent">{{ option.label }}</span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-2"
              >
                <CheckIcon class="h-3 w-3 color-$figma-color-text-oncomponent" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<style scoped>
.my-font {
  font-weight: 400;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-feature-settings: "liga", "calt";
}
</style>

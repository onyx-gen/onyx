<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import { CheckIcon } from '@heroicons/vue/20/solid'

const people = [
  { name: 'Wade Cooper' },
  { name: 'Arlene Mccoy' },
  { name: 'Devon Webb' },
  { name: 'Tom Cook' },
  { name: 'Tanya Fox' },
  { name: 'Hellen Schmidt' },
]

interface Person {
  name: string
}

const model = defineModel<Person>()
</script>

<template>
  <Listbox v-model="model" by="name">
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
        <span class="inline-block truncate color-$figma-color-text my-font">{{ model?.name }}</span>
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
          class="absolute mt-1 max-h-60 overflow-auto rounded-sm bg-[rgb(30,30,30)] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="person in people"
            v-slot="{ active, selected }"
            :key="person.name"
            :value="person"
            as="template"
          >
            <li
              class="relative cursor-default select-none pl-7 pr-3 py-0.5"
              :class="{
                'bg-$figma-color-bg-success': active,
              }"
            >
              <span class="block truncate my-font color-$figma-color-text">{{ person.name }}</span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-2"
              >
                <CheckIcon class="h-3 w-3 color-$figma-color-text" aria-hidden="true" />
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

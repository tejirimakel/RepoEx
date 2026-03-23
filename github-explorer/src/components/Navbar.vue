<template>
    <header class="border-b bg-white sticky top-0 z-50 dark:bg-neutral-900 dark:border-neutral-700">
        <nav class="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

            <h1 class="text-xl md:text-2xl font-bold">
                <router-link to="/" class="hover:text-neutral-200 transition">
                GitHub Explorer
                </router-link>
            </h1>

            <div class="hidden md:flex items-center gap-6">
                <router-link to="/" class="nav-link" active-class="active-link">
                    Home
                </router-link>

                <router-link to="/favorite" class="nav-link" active-class="active-link">
                    Favorites
                </router-link>
            </div>

            <button class="md:hidden text-xl relative z-50" @click="isOpen = !isOpen"
                :aria-label="isOpen ? 'Close menu' : 'Open menu'">
                <span v-if="isOpen">✕</span>
                <span v-else>☰</span>
            </button>
        </nav>

        <transition name="dropdown">
            <div v-if="isOpen" class="md:hidden px-4 py-4 space-y-2 border-t bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
                <router-link to="/" class="block nav-link" active-class="active-link" @click="isOpen = false">
                    Home
                </router-link>

                <router-link to="/favorite" class="block nav-link" active-class="active-link" @click="isOpen = false">
                    Favorites
                </router-link>
            </div>
        </transition>
    </header>
</template>

<script setup>
import { ref } from "vue"

const isOpen = ref(false)
</script>
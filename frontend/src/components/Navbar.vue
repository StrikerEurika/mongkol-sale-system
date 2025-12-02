<template>
  <nav
    :class="[
      'fixed top-0 right-0 bg-white shadow-md z-40 transition-all duration-300 ease-in-out',
      sidebarOpen ? 'left-64' : 'left-0',
    ]"
  >
    <div class="h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <!-- Left Content: Toggle Button + Logo -->
      <div class="flex items-center gap-2">
        <button
          @click="toggleSidebar"
          class="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div class="flex-shrink-0">
          <h1
            class="text-xl font-bold font-heading text-orange-600 whitespace-nowrap"
          >
            {{ $t("components.navbar.navTitle") }}
          </h1>
        </div>
      </div>

      <!-- Right Content: Language Switcher, User Info, Logout -->
      <div class="flex items-center gap-4 ml-auto">
        <!-- Language Switcher -->
        <LanguageSwitcher />

        <!-- User Name (hidden on very small screens) -->
        <span class="text-sm font-medium text-gray-700 hidden sm:inline">
          {{ user?.name }}
        </span>

        <!-- User Role Badge (hidden on small screens) -->
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hidden sm:inline-flex"
        >
          {{ user?.role }}
        </span>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
        >
          {{ $t("components.navbar.logOutButton") }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LanguageSwitcher from "./LanguageSwitcher.vue";

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
}>();

interface Props {
  sidebarOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sidebarOpen: false,
});

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.currentUser);

const sidebarOpen = computed(() => props.sidebarOpen);

const toggleSidebar = () => {
  emit("toggle-sidebar");
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

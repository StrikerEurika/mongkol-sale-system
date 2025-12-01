<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <!-- Header with toggle and search -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Toggle Buttons -->
      <div class="flex space-x-2">
        <button
          @click="activeView = 'list'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeView === 'list'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          <FontAwesomeIcon class="mr-1" :icon="['fas', 'list']" />
          {{ $t("pages.customersPage.listViewButton") }}
        </button>

        <button
          @click="activeView = 'map'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeView === 'map'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          <FontAwesomeIcon class="mr-1" :icon="['fas', 'map']" />
          {{ $t("pages.customersPage.mapViewButton") }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 relative">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          v-if="activeView === 'list'"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('pages.customersPage.searchPlaceholder.byName')"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
        />
        <input
          v-else
          v-model="provinceFilter"
          type="text"
          :placeholder="$t('pages.customersPage.searchPlaceholder.byProvince')"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-2">
        <button
          @click="confirmSelection"
          class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
        >
          {{ $t("pages.customersPage.confirmButton") }}
        </button>

        <button
          @click="addNewCustomer"
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium flex items-center"
        >
          <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          {{ $t("pages.customersPage.addCustomerButton") }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="border rounded-lg overflow-hidden">
      <!-- List View -->
      <div v-if="activeView === 'list'" class="bg-yellow-50">
        <div class="overflow-x-auto">
          <BaseTable
            :data="filteredAndSortedCustomers"
            :columns="columns"
            :rows="filteredAndSortedCustomers"
            :sortable="true"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            @sort="sortData"
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredAndSortedCustomers.length === 0"
          class="py-10 text-center text-gray-500"
        >
          No customers found matching your search.
        </div>
      </div>

      <!-- Map View -->
      <div v-else class="relative h-[600px] bg-green-50">
        <div ref="chartContainer" class="w-full h-full"></div>

        <!-- Province selection overlay (optional) -->
        <div
          v-if="selectedProvince"
          class="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg"
        >
          <p class="text-sm font-medium text-gray-800">
            Selected: {{ selectedProvince }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  nextTick,
  defineEmits,
} from "vue";
import * as echarts from "echarts";
import { useDebounceFn } from "@vueuse/core";

import BaseTable from "./BaseTable.vue";

// Define types for our data
interface Customer {
  id: number;
  name: string;
  telephone: string;
  type: string;
  province: string;
}

// Define the events emitted by this component
const emit = defineEmits(["openCustomerModal"]);

// Function to trigger the modal
const addNewCustomer = () => {
  emit("openCustomerModal", null);
};

const columns = [
  { label: "Name", key: "name" },
  { label: "Telephone", key: "telephone" },
  { label: "Type", key: "type" },
  { label: "Province", key: "province" },
];

// State management
const activeView = ref<"list" | "map">("list");
const searchQuery = ref("");
const provinceFilter = ref("");
const sortBy = ref<"name" | "type" | "province">("name");
const sortOrder = ref<"asc" | "desc">("asc");
const selectedProvince = ref<string | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Sample data - replace with actual API call in production
const customers = ref<Customer[]>([
  {
    id: 1,
    name: "HUN Sopheak",
    telephone: "0127894455",
    type: "Distributor",
    province: "Banteay Meanchey",
  },
  {
    id: 2,
    name: "NGEAN Tina",
    telephone: "097632541",
    type: "Pagoda",
    province: "Phnom Penh",
  },
  {
    id: 3,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Event",
    province: "Phnom Penh",
  },
  {
    id: 4,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Home",
    province: "Phnom Penh",
  },
  {
    id: 5,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Event",
    province: "Phnom Penh",
  },
  {
    id: 6,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Event",
    province: "Phnom Penh",
  },
  {
    id: 7,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Event",
    province: "Phnom Penh",
  },
  {
    id: 8,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Event",
    province: "Phnom Penh",
  },
  {
    id: 9,
    name: "HUON Sopanha",
    telephone: "0979654123",
    type: "Event",
    province: "Phnom Penh",
  },
]);

// Computed properties
const filteredAndSortedCustomers = computed(() => {
  let filtered = customers.value.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.telephone.includes(searchQuery.value) ||
      customer.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.province.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesSearch;
  });

  // Sort the filtered data
  filtered.sort((a, b) => {
    let comparison = 0;
    if (a[sortBy.value] < b[sortBy.value]) {
      comparison = -1;
    } else if (a[sortBy.value] > b[sortBy.value]) {
      comparison = 1;
    }

    return sortOrder.value === "asc" ? comparison : -comparison;
  });

  return filtered;
});

// ECharts container reference
const chartContainer = ref<HTMLElement | null>(null);

// Initialize ECharts when component mounts
onMounted(() => {
  if (activeView.value === "map") {
    initializeChart();
  }
});

// Clean up ECharts instance when component unmounts
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// Watch for view changes to initialize or dispose of chart
watch(activeView, (newView) => {
  if (newView === "map") {
    nextTick(() => {
      initializeChart();
    });
  } else {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
  }
});

// Initialize the ECharts map
const initializeChart = () => {
  if (!chartContainer.value) return;

  // Dispose existing instance if any
  if (chartInstance) {
    chartInstance.dispose();
  }

  // Create new instance
  chartInstance = echarts.init(chartContainer.value);

  // Define Cambodia provinces data (simplified for demo)
  const cambodiaProvinces = [
    { name: "Banteay Meanchey", value: 1 },
    { name: "Oddar Meanchey", value: 1 },
    { name: "Siemreap", value: 1 },
    { name: "Pursat", value: 1 },
    { name: "Koh Kong", value: 1 },
    { name: "Preah Vihear", value: 1 },
    { name: "Stung Treng", value: 1 },
    { name: "Ratanak Kiri", value: 1 },
    { name: "Mondul Kiri", value: 1 },
    { name: "Kratié", value: 1 },
    { name: "Kampong Thom", value: 1 },
    { name: "Kampong Chhnang", value: 1 },
    { name: "Kampong Speu", value: 1 },
    { name: "Kampot", value: 1 },
    { name: "Kandal", value: 1 },
    { name: "Phnom Penh", value: 1 },
    { name: "Prey Veng", value: 1 },
    { name: "Svay Rieng", value: 1 },
    { name: "Takeo", value: 1 },
    { name: "Tboung Khmum", value: 1 },
    { name: "Kep", value: 1 },
    { name: "Pailin", value: 1 },
    { name: "Kampong Cham", value: 1 },
    { name: "Battambang", value: 1 },
  ];

  // Configure ECharts options
  const option = {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        return `${params.name}<br/>${params.value} customers`;
      },
    },
    visualMap: {
      min: 0,
      max: 10,
      text: ["High", "Low"],
      realtime: false,
      calculable: true,
      inRange: {
        color: ["#e6f7ff", "#008000"],
      },
    },
    series: [
      {
        name: "Cambodia Provinces",
        type: "map",
        map: "cambodia",
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10,
          color: "#ffffff",
        },
        itemStyle: {
          areaColor: "#4CAF50",
          borderColor: "#ffffff",
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: "#8BC34A",
          },
        },
        data: cambodiaProvinces.map((province) => ({
          name: province.name,
          value: province.value,
        })),
      },
    ],
  };

  // Set options and handle resize
  chartInstance.setOption(option);
  window.addEventListener("resize", () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });

  // Handle click events on map
  chartInstance.on("click", (params: any) => {
    if (params.name) {
      selectedProvince.value = params.name;
    }
  });
};

// Sorting function
const sortData = (field: "name" | "type" | "province") => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortOrder.value = "asc";
  }
};

// Debounced search for better performance
const debouncedSearch = useDebounceFn(() => {
  // This is handled by computed property automatically
}, 300);

// Watch for search query changes
watch(searchQuery, debouncedSearch);

// Confirm selection button handler
const confirmSelection = () => {
  if (selectedProvince.value) {
    alert(`Confirmed selection: ${selectedProvince.value}`);
    // Add your confirmation logic here
  } else {
    alert("Please select a province first.");
  }
};


// Expose methods if needed for parent components
defineExpose({
  activeView,
  selectedProvince,
  confirmSelection,
  addNewCustomer,
});
</script>

<style scoped>
/* Custom styles for the component */
</style>

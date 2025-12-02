<template>
  <!-- Responsive container for the chart -->
  <div
    ref="chartContainerRef"
    class="w-full h-96 md:h-[400px] lg:h-[500px] bg-white rounded-xl shadow-lg p-4 transition-all duration-300"
  >
    <!-- Fallback when chart fails to render -->
    <div
      v-if="!chartInstance"
      :class="['flex items-center,justify-center h-full text-gray-500']"
    >
      Loading chart...
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  computed,
} from "vue";
import type { Ref } from "vue";
import * as echarts from "echarts/core";
import { BarChart, type BarSeriesOption } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Register required ECharts components
echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
]);

// Define props interface with flexible data options
interface BarChartProps {
  // Alternative 1: Array of objects with category and value
  data?: Array<{
    category: string;
    value: number;
    [key: string]: any;
  }>;
  categories?: string[];
  values?: number[];
  title?: string;
  xAxisName?: string;
  yAxisName?: string;
  color?: string;
  autoResize?: boolean;
  animation?: boolean;
}

// Define default props
const props = withDefaults(defineProps<BarChartProps>(), {
  data: () => [],
  categories: () => [],
  values: () => [],
  title: "",
  xAxisName: "",
  yAxisName: "",
  color: "#4f46e5", // Tailwind indigo-600
  autoResize: true,
  animation: true,
});

// Reference to chart container
const chartContainerRef = ref<HTMLDivElement | null>(null);
// Reference to chart instance
const chartInstance: Ref<echarts.ECharts | null> = ref(null);

// Computed property to normalize data format
const normalizedData = computed(() => {
  // Use separate arrays if provided (takes precedence)
  if (props.categories.length && props.values.length) {
    return {
      categories: props.categories,
      values: props.values,
    };
  }

  // Otherwise use object array format
  return {
    categories: props.data.map((item) => item.category),
    values: props.data.map((item) => item.value),
  };
});

// Initialize chart
const initChart = () => {
  if (!chartContainerRef.value) return;

  // Dispose previous instance if exists
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  // Create new chart instance
  chartInstance.value = echarts.init(chartContainerRef.value);

  // Generate chart options using computed data
  const options: echarts.EChartsCoreOption = {
    // Title configuration
    title: props.title
      ? {
          text: props.title,
          left: "center",
          textStyle: {
            fontSize: 18,
            fontWeight: "bold",
          },
        }
      : undefined,

    // Tooltip configuration
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },

    // Grid layout
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: props.title ? "15%" : "5%",
      containLabel: true,
    },

    // X-axis configuration
    xAxis: {
      type: "category",
      data: normalizedData.value.categories,
      axisTick: {
        alignWithLabel: true,
      },
      name: props.xAxisName,
      nameLocation: "middle",
      nameGap: 30,
    },

    // Y-axis configuration
    yAxis: {
      type: "value",
      name: props.yAxisName,
      nameLocation: "middle",
      nameGap: 50,
    },

    // Series configuration
    series: {
      name: props.title || "Values",
      type: "bar",
      barWidth: "60%",
      data: normalizedData.value.values,
      itemStyle: {
        color: props.color,
        borderRadius: [4, 4, 0, 0],
      },
      // Animation settings
      animation: props.animation,
      animationDuration: 800,
      animationEasing: "cubicOut",
    } as BarSeriesOption,
  };

  // Apply options and render chart
  chartInstance.value.setOption(options);
};

// Handle window resize for responsive behavior
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

// Watch for data changes and update chart
watch(
  () => [normalizedData.value, props.title, props.xAxisName, props.yAxisName],
  () => {
    if (chartInstance.value) {
      // Defer update to ensure DOM is ready
      nextTick(() => {
        initChart();
      });
    }
  },
  { deep: true }
);

// Lifecycle hooks
onMounted(async () => {
  // Wait for next tick to ensure DOM is ready
  await nextTick();
  initChart();

  // Add resize listener if auto-resize is enabled
  if (props.autoResize) {
    window.addEventListener("resize", handleResize);
  }
});

onBeforeUnmount(() => {
  // Clean up chart instance and event listeners
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  if (props.autoResize) {
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<style scoped>
/* Additional Tailwind styling for transitions */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}
</style>

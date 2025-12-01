<template>
  <div class="w-full h-full flex flex-col">
    <div
      ref="chartRef"
      class="w-full h-full bg-slate-900/90 rounded-2xl shadow-lg overflow-hidden"
      style="height: 100%; width: 100%"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import { useResizeObserver } from "@vueuse/core"; // optional, but nice
import * as echarts from "echarts/core";
import { MapChart, ScatterChart } from "echarts/charts";
import {
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GeoComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption, SetOptionOpts } from "echarts/core";
import type { MapSeriesOption, ScatterSeriesOption } from "echarts/charts";
import type {
  TooltipComponentOption,
  VisualMapComponentOption,
  LegendComponentOption,
  GeoComponentOption,
} from "echarts/components";
import khGeoJson from "@/assets/geo/cambodia.json";
import type { CustomerPoint, ProvinceStat } from "@/types/index";

// --- ECharts setup ---
echarts.use([
  MapChart,
  ScatterChart,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GeoComponent,
  CanvasRenderer,
]);

// Register Cambodia map once.
echarts.registerMap("cambodia", khGeoJson as any);

// Compose option type for TS safety
type ECOption = ComposeOption<
  | MapSeriesOption
  | ScatterSeriesOption
  | TooltipComponentOption
  | VisualMapComponentOption
  | LegendComponentOption
  | GeoComponentOption
>;

// --- Props ---
const props = defineProps<{
  customers: CustomerPoint[];
  provinceStats: ProvinceStat[]; // aggregated per province
  loading?: boolean;
}>();

// --- Refs & state ---
const chartRef = ref<HTMLDivElement | null>(null);
const chartInstance = ref<echarts.ECharts | null>(null);

// Compute min/max for visualMap
const visualMin = computed(() =>
  props.provinceStats.length
    ? Math.min(...props.provinceStats.map((p) => p.value))
    : 0
);
const visualMax = computed(() =>
  props.provinceStats.length
    ? Math.max(...props.provinceStats.map((p) => p.value))
    : 1
);

// Transform customers for scatter series
const scatterData = computed(() =>
  props.customers.map((c) => ({
    name: c.name,
    value: [c.lng, c.lat, c.value], // [lng, lat, metric]
    customerId: c.id,
    province: c.province,
  }))
);

// ECharts option
const chartOption = computed<ECOption>(() => {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        // Map series
        if (params.seriesType === "map") {
          const name = params.name;
          const value = params.value ?? 0;
          return `
            <div class="text-xs">
              <div class="font-semibold">${name}</div>
              <div>Customers: <span class="font-mono">${value}</span></div>
            </div>
          `;
        }

        // Scatter series (customers)
        if (params.seriesType === "scatter") {
          const value = Array.isArray(params.value)
            ? params.value[2]
            : params.value;
          const data = params.data as any;
          return `
            <div class="text-xs">
              <div class="font-semibold">${params.name || "Customer"}</div>
              <div>Province: ${data.province ?? "N/A"}</div>
              <div>Value: <span class="font-mono">${value}</span></div>
            </div>
          `;
        }

        return "";
      },
    } as TooltipComponentOption,
    legend: {
      left: "left",
      bottom: 12,
      orient: "vertical",
      textStyle: {
        color: "#e5e7eb",
        fontSize: 11,
      },
      itemWidth: 12,
      itemHeight: 8,
      data: ["Customer Density", "Customers"],
    } as LegendComponentOption,
    visualMap: {
      type: "continuous",
      min: visualMin.value,
      max: visualMax.value,
      text: ["High", "Low"],
      realtime: true,
      calculable: true,
      orient: "vertical",
      right: 20,
      bottom: 20,
      inRange: {
        color: ["#e0f2fe", "#38bdf8", "#0ea5e9", "#0369a1"],
      },
      textStyle: {
        color: "#e5e7eb",
      },
    } as VisualMapComponentOption,
    geo: {
      map: "cambodia",
      roam: true,
      zoom: 1.2,
      label: {
        show: false,
        color: "#cbd5f5",
        fontSize: 10,
      },
      itemStyle: {
        borderColor: "#1e293b",
        borderWidth: 1,
        areaColor: "#020617",
      },
      emphasis: {
        itemStyle: {
          areaColor: "#0f172a",
        },
        label: {
          show: true,
          color: "#f9fafb",
        },
      },
    } as GeoComponentOption,
    series: [
      // Background shaded map by provinceStats
      {
        name: "Customer Density",
        type: "map",
        map: "cambodia",
        geoIndex: 0,
        data: props.provinceStats,
        emphasis: {
          itemStyle: {
            areaColor: "#0f172a",
          },
        },
      } as MapSeriesOption,
      // Scatter customers on top
      {
        name: "Customers",
        type: "scatter",
        coordinateSystem: "geo",
        data: scatterData.value,
        symbolSize: (val) => {
          const metric = Array.isArray(val) ? val[2] : 1;
          const size = 6 + Math.sqrt(metric);
          return Math.min(size, 24); // clamp for sanity
        },
        encode: {
          value: 2,
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(56, 189, 248, 0.5)",
        },
        emphasis: {
          scale: true,
        },
        large: props.customers.length > 2000,
        progressive: 3000,
        progressiveThreshold: 2000,
      } as ScatterSeriesOption,
    ],
  };
});

// Initialize chart
const initChart = () => {
  if (!chartRef.value) return;
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  chartInstance.value = echarts.init(chartRef.value, undefined, {
    renderer: "canvas",
  });

  updateChart();
};

// Update chart options
const updateChart = () => {
  if (!chartInstance.value) return;
  const opts: SetOptionOpts = {
    notMerge: false,
    lazyUpdate: true,
  };
  chartInstance.value.setOption(chartOption.value, opts);
};

// Watch data changes
watch(
  () => [props.customers, props.provinceStats],
  () => {
    updateChart();
  },
  { deep: true }
);

// Handle resize (with VueUse)
useResizeObserver(chartRef, () => {
  if (!chartInstance.value) return;
  chartInstance.value.resize();
});

// Mount / unmount
onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
});
</script>

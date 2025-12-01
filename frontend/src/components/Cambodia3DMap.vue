<template>
  <div class="w-full h-full">
    <div
      ref="chartContainer"
      class="w-full h-full"
      style="min-height: 600px"
    ></div>
  </div>
</template>

<script setup lang="ts">
// Expose a method to reset map position and direction
const resetMapView = () => {
  if (!chartInstance) return;
  if (props.viewType === "3d") {
    chartInstance.setOption({
      series: [
        {
          type: "map3D",
          viewControl: {
            distance: 125,
            alpha: 90,
            beta: 0,
          },
          // Optionally reset other properties if needed
        },
      ],
    });
  } else {
    chartInstance.setOption({
      series: [
        {
          type: "map",
          zoom: 1.2,
          center: [104.9282, 12.5657], // Cambodia center
        },
      ],
    });
  }
};

defineExpose({ resetMapView });
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import cambodiaGeoJson from "@/assets/geo/kh.json";

// Accept viewType prop
const props = defineProps<{ viewType: "2d" | "3d" }>();

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const renderMap = () => {
  if (!chartContainer.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartContainer.value);

  echarts.registerMap("cambodia", cambodiaGeoJson as any);

  let series;
  if (props.viewType === "3d") {
    series = [
      {
        type: "map3D",
        map: "cambodia",
        roam: true,
        shading: "lambert",
        label: {
          show: true,
          textStyle: {
            color: "#fff",
            fontSize: 10,
            backgroundColor: "rgba(0,0,0,0.3)",
          },
        },
        itemStyle: {
          areaColor: "#4CAF50",
          borderColor: "#fff",
        },
        emphasis: {
          label: {
            show: true,
            textStyle: {
              color: "#ff0",
              fontSize: 12,
            },
          },
          itemStyle: {
            areaColor: "#8BC34A",
          },
        },
        data: cambodiaGeoJson.features.map((f) => ({
          name: f.properties.name,
          value: Math.floor(Math.random() * 100), // Demo value
        })),
        viewControl: {
          distance: 125,
          alpha: 40,
          beta: 0,
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true,
          },
          ambient: {
            intensity: 0.3,
          },
        },
      },
    ];
  } else {
    series = [
      {
        type: "map",
        map: "cambodia",
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10,
          color: "#000000",
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
        data: cambodiaGeoJson.features.map((f) => ({
          name: f.properties.name,
          value: Math.floor(Math.random() * 100), // Demo value
        })),
      },
    ];
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) =>
        `${params.name}<br/>${params.value || 0} customers`,
    },
    visualMap: {
      min: 0,
      max: 100,
      text: ["High", "Low"],
      realtime: false,
      calculable: true,
      inRange: {
        color: ["#ffffff", "#FF00A4"],
      },
    },
    series,
  };

  chartInstance.setOption(option);
  window.addEventListener("resize", () => {
    chartInstance && chartInstance.resize();
  });
};

onMounted(renderMap);

watch(
  () => props.viewType,
  () => {
    renderMap();
  }
);

onBeforeUnmount(() => {
  chartInstance && chartInstance.dispose();
});
</script>

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ column.label }}
          </th>
          <th
            v-if="actions.length"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-if="rows.length > 0">
          <tr v-for="(row, index) in rows" :key="row.id || index">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            >
              {{ row[column.key] }}
            </td>
            <td
              v-if="actions.length"
              class="px-6 py-4 whitespace-nowrap text-sm font-medium"
            >
              <button
                v-for="action in actions"
                :key="action.label"
                @click="() => action.handler(row)"
                :class="action.class"
                class="mr-3"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
        </template>
        
        <template v-else>
          <tr>
            <td colspan="100%" class="text-center py-4 text-gray-500">
              No data available
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";

defineProps({
  columns: {
    type: Array as PropType<Array<{ label: string; key: string }>>,
    required: true,
  },
  rows: {
    type: Array as PropType<Array<Record<string, any>>>,
    default: () => [], // Default to an empty array
  },
  actions: {
    type: Array as PropType<
      Array<{ label: string; handler: (row: any) => void; class?: string }>
    >,
    default: () => [], // Default to an empty array
  },
});
</script>

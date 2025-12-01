<template>
  <div
    v-if="dialog"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4"
  >
    <div class="bg-white rounded-lg w-full max-w-lg p-6">
      <h3 class="text-lg font-bold mb-4">
        {{ $t("pages.customersPage.addCustomerModal.title") }}
      </h3>
      <form @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4">
          <input
            v-model="form.name"
            :placeholder="$t('pages.customersPage.addCustomerModal.name')"
            class="border p-2 rounded"
            :disabled="loading"
          />
          <input
            v-model="form.phone"
            :placeholder="$t('pages.customersPage.addCustomerModal.phone')"
            class="border p-2 rounded"
            :disabled="loading"
          />
          <select
            v-model="form.type"
            class="border p-2 rounded"
            :disabled="loading"
          >
            <option
              v-for="type in typeOptions"
              :key="type.value"
              :value="type.value"
            >
              {{ type.title }}
            </option>
          </select>
          <select
            v-model="form.province"
            class="border p-2 rounded"
            :disabled="loading"
          >
            <option
              v-for="province in provinceOptions"
              :key="province.value"
              :value="province.value"
            >
              {{ province.title }}
            </option>
          </select>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            @click="closeDialog"
            class="px-4 py-2 rounded bg-gray-200"
            :disabled="loading"
          >
            {{ $t("pages.customersPage.addCustomerModal.cancelButton") }}
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-orange-600 text-white"
            :disabled="loading"
          >
            {{
              form.id
                ? $t("pages.customersPage.addCustomerModal.updateButton")
                : $t("pages.customersPage.addCustomerModal.createButton")
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import type { Customer } from "@/types"; // Define this interface according to your needs

// Define props
interface Props {
  modelValue: boolean;
  item?: Customer | null;
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
});

// Define emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [item: Customer];
}>();

// Form validation
const formRef = ref();

// Form data
const form = reactive<Customer>({
  id: null,
  name: "",
  telephone: "",
  type: "",
  province: "",
  email: "",
  phone: "",
  address: "",
  created_at: new Date().toISOString(),
});

// Options for selects
const typeOptions = ref([
  { title: "Individual", value: "individual" },
  { title: "Business", value: "business" },
  { title: "Government", value: "government" },
]);

const provinceOptions = ref([
  { title: "Province A", value: "provinceA" },
  { title: "Province B", value: "provinceB" },
  { title: "Province C", value: "provinceC" },
  // Add your actual provinces here
]);

// Computed properties
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const loading = ref(false);

// Watch for item changes to reset form
watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      Object.assign(form, newItem);
    } else {
      resetForm();
    }
  },
  { deep: true }
);

// Methods
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: "",
    telephone: "",
    type: "",
    province: "",
  });
};

const closeDialog = () => {
  resetForm();
  emit("update:modelValue", false);
};

const save = async () => {
  if (!formRef.value?.validate()) return;

  loading.value = true;

  try {
    // Add your API call here
    // await apiService.saveCustomer(form);

    emit("save", { ...form });
    closeDialog();
  } catch (error) {
    console.error("Save error:", error);
    // Handle error (show notification, etc.)
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>

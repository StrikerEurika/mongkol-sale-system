<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6 rubik-regular">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ $t("pages.customersPage.title") }}
      </h1>
    </div>

    <CustomerListAndMap
      :customers="customers"
      @openCustomerModal="handleOpenCustomerModal"
    />

    <!-- Add/Edit Customer Modal -->
    <!-- <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingCustomer ? "Edit Customer" : "Add New Customer" }}
          </h3>
        </div>
        <form @submit.prevent="saveCustomer" class="px-6 py-4">
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="name"
            >
              Name
            </label>
            <input
              id="name"
              v-model="form.name"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              required
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="email"
            >
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              required
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="phone"
            >
              Phone
            </label>
            <input
              id="phone"
              v-model="form.phone"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="tel"
              required
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="address"
            >
              Address
            </label>
            <textarea
              id="address"
              v-model="form.address"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="notes"
            >
              Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
            ></textarea>
          </div>
          <div class="flex items-center justify-between">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div> -->
    <CustomerModal
      v-model="isCustomerModalOpen"
      :item="selectedCustomer"
      @save="handleSaveCustomer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDataStore } from "@/stores/data";
import type { Customer } from "@/types";

import CustomerListAndMap from "@/components/CustomerListAndMap.vue";
import CustomerModal from "@/components/AddCustomerModal.vue";

const dataStore = useDataStore();

const isCustomerModalOpen = ref(false);
const selectedCustomer = ref<Customer | null>(null);

const handleOpenCustomerModal = (customer: Customer | null) => {
  selectedCustomer.value = customer; // Set the customer data (null for new customer)
  isCustomerModalOpen.value = true; // Open the modal
};

const handleSaveCustomer = (customer: Customer) => {
  console.log("Customer saved:", customer);
  // Add your logic to save the customer (e.g., API call)
};
const showModal = ref(false);
const editingCustomer = ref<Customer | null>(null);
const form = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  telephone: "",
  type: "",
  province: "",
});

const customers = computed(() => dataStore.allCustomers);

onMounted(async () => {
  // Prefer store-provided customers (populated from staticData in DEV).
  if (!dataStore.allCustomers || dataStore.allCustomers.length === 0) {
    // In a real app you'd fetch from API. For now seed with mock data.
    const mockCustomers: Customer[] = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        address: "123 Main St",
        notes: "Regular customer",
        created_at: "2023-01-01T00:00:00Z",
        telephone: "123-456-7890",
        type: "Regular",
        province: "Province A",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "098-765-4321",
        address: "456 Oak Ave",
        notes: "VIP customer",
        created_at: "2023-01-02T00:00:00Z",
        telephone: "098-765-4321",
        type: "VIP",
        province: "Province B",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "555-123-4567",
        address: "789 Pine Rd",
        notes: "New customer",
        created_at: "2023-01-03T00:00:00Z",
        telephone: "555-123-4567",
        type: "New",
        province: "Province C",
      },
    ];

    dataStore.setCustomers(mockCustomers);
  }
});

// @ts-ignore
function editCustomer(customer: Customer) {
  editingCustomer.value = customer;
  form.value = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes || "",
    telephone: customer.telephone || "",
    type: customer.type || "",
    province: customer.province || "",
  };
  showModal.value = true;
}

// @ts-ignore
async function deleteCustomer(id: number) {
  if (confirm("Are you sure you want to delete this customer?")) {
    try {
      // In a real app, call your API here
      // For this example, we'll remove from the mock data
      dataStore.customers = dataStore.customers.filter(
        (customer) => customer.id !== id
      );
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  }
}

</script>

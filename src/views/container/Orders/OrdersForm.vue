<template>
  <v-container id="Servicios-profile" fluid tag="section">
    <v-row justify="center">
      <base-material-card icon="mdi-account-outline">
        <template v-slot:heading>
          <v-tabs
            v-model="tabs"
            background-color="transparent"
            slider-color="white"
          >
            <v-tab class="mr-3">
              <v-icon class="mr-2">
                mdi-account-key
              </v-icon>
              <!-- {{ getTitleButton }} -->
              Realizar nuevo pedido
            </v-tab>
          </v-tabs>
        </template>

        <v-card-text style="height: 100px; position: relative">
          <v-fab-transition>
            <v-btn
              fab
              dark
              small
              color="gray"
              absolute
              right
              top
              @click="$router.go(-1)"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-fab-transition>
        </v-card-text>
        <v-divider class="mt-5" />
        <v-autocomplete
          v-model="searchTerm"
          :items="items"
          item-value="codigo"
          item-text="name"
          label="Buscar producto"
          clearable
        />
        <!-- Table inventary -->
        <v-divider class="mt-10" />
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :search.sync="search"
          :sort-by="['id', 'titulo']"
          :sort-desc="[false, true]"
          multi-sort
          class="elevation-1"
        >
        <template v-slot:item.actions="{ item }">
            <v-checkbox
              v-model="item.selected"
              :disabled="item.cant <= 0"
              @change="toggleProduct(item)"
            ></v-checkbox>
            <v-text-field
              v-model.number="item.quantity"
              type="number"
              min="1"
              :max="item.cant"
              label="Cantidad"
              v-if="item.selected"
              :rules="[v => (item.quantity <= item.cant) || `Maximo disponible: ${item.cant}`]"
              @input="validateQuantity(item)"
              :error-messages="item.errorMessages"
            ></v-text-field>
          </template>
        </v-data-table>
        <v-divider class="mt-10" />
        <!-- Table orders with products selecteds -->
        <v-data-table
          :headers="orderHeaders"
          :items="selectedItems"
          class="elevation-1"
        >
          <template v-slot:item.total="{ item }">
            {{ (item.priceD * item.quantity).toFixed(2) }}
          </template>
          <template v-slot:footer>
            <v-footer>
              <v-col class="text-right">
                <strong>Total: {{ totalOrderPrice.toFixed(2) }} bs</strong>
              </v-col>
            </v-footer>
          </template>
        </v-data-table>
        <v-btn color="success" class="mr-0" @click="confirmOrder">
          Confirmar Pedido
        </v-btn>
      </base-material-card>
    </v-row>
  </v-container>
</template>

<script>
import i18n from "@/i18n";
import { createorder, updateorder } from "../../../api/modules/orders";
import { inventoryGetList } from "../../../api/modules/inventory";
export default {
  data: () => ({
    tabs: 0,
    option: 0,
    title: "",
    snackbar: "",
    message: "",
    ordersData: {
      id: "",
      type: "",
      amount: "",
      status: ""
    },
    headers: [
      {
        text: "Código",
        value: "codigo"
      },
      {
        text: "Nombre",
        value: "name"
      },
      {
        text: "Marca",
        value: "marca"
      },
      {
        text: "cantidad",
        value: "cant"
      },
      {
        text: "Precio al Detal",
        value: "priceD"
      },
      {
        text: "Precio al Mayor",
        value: "priceM"
      },
      {
          sortable: false,
          text: 'Acciones',
          value: 'actions',
        },
    ],
    items: [],
    filteredItems: [],
    searchTerm: '',
    orderHeaders: [
      { text: "Nombre", value: "name" },
      { text: "Precio Unitario", value: "priceD" },
      { text: "Cantidad", value: "quantity" },
      { text: "Precio Total", value: "total" },
    ],
    selectedItems: [],
    maxQuantityError: ''
  }),
  computed: {
    getTitle() {
      if (this.option === 1) return i18n.t("orders.create");
      else if (this.option === 2) return i18n.t("orders.show");
      else if (this.option === 3) return i18n.t("orders.edit");
      else return i18n.t("orders.head");
    },
    getTitleButton() {
      if (this.option === 1) return i18n.t("crud.create");
      else if (this.option === 2) return i18n.t("crud.show");
      else if (this.option === 3) return i18n.t("crud.edit");
      else return i18n.t("orders.head");
    },
    totalOrderPrice() {
      return this.selectedItems.reduce((sum, item) => sum + item.priceD * item.quantity, 0);
    }
  },
  mounted() {
    this.initialize(), this.data();
  },
  methods: {
    data: async function() {
      let result;
      result = await inventoryGetList();
      if (result.status == 200) {
        console.log(result.data);
        this.items = result.data;
        this.filteredItems = result.data;
      } else {
        this.dialog = true;
        this.message = result.message.text;
      }
    },

    async confirmOrder() {
      try {
        // Aquí puedes agregar la lógica para recolectar la información del pedido
        const orderData = {
          client_id: this.selectedClient,
          items: this.selectedItems, // Asegúrate de tener los productos seleccionados en 'selectedItems'
          total_price: this.totalPrice, // Calcula el precio total del pedido
          // Otros datos necesarios
        };

        // Llama a tu API para enviar los datos del pedido
        const response = await apiHttp('post', '/api/v1/orders', orderData);

        if (response.status === 201) {
          this.snackbar = true;
          this.message = 'Pedido realizado exitosamente';

          // Redirige al usuario a la tabla de pedidos o actualiza la tabla
          setTimeout(() => {
            this.$router.push({ name: 'Orders' });
          }, 2000);
        } else {
          this.snackbar = true;
          this.message = 'Hubo un error al realizar el pedido';
        }
      } catch (error) {
        this.snackbar = true;
        this.message = 'Ocurrió un error al conectarse con el servidor';
      }
    },

    initialize() {
      this.option = this.$route.params.option;
      if (this.option === 3 || this.option === 2) {
        this.ordersData = this.$route.params.ordersData;
      }
    },
    async submit() {
      if (this.option === 1) {
        if (this.$refs.form.validate()) {
          let orders = {
            id: this.ordersData.id,
            type: this.ordersData.type,
            amount: this.ordersData.amount
          };
          console.log("🚀 ~ submit ~ order:", orders);
          orders = await createorder(orders);

          if (orders != null) {
            this.snackbar = true;
            this.message = "Registro exitoso";
            setTimeout(() => {
              this.$router.push({ name: "orders" });
            }, 2000);
          } else {
            this.snackbar = true;
            this.message = "Hubo un error durante el registro";
            setTimeout(() => {
              this.snackbar = false;
            }, 1000);
          }
        } else {
          this.snackbar = true;
          this.message = "Debe llenar todos los campos requeridos";
          setTimeout(() => {
            this.snackbar = false;
          }, 1000);
        }
      }
      if (this.option === 3) {
        if (this.$refs.form.validate()) {
          let orders = {
            id: this.ordersData.id,
            type: this.ordersData.type,
            amount: this.ordersData.amount
          };
          console.log("orden que se envia ", orders);
          orders = await updateorder(orders);
          if (orders != null) {
            this.snackbar = true;
            this.message = "Actualizacion exitosa";
            setTimeout(() => {
              this.$router.push({ name: "orders" });
            }, 2000);
          } else {
            this.snackbar = true;
            this.message = "Hubo un error durante la actualizacion";
            setTimeout(() => {
              this.snackbar = false;
            }, 1000);
          }
        } else {
          this.snackbar = true;
          this.message = "Debe llenar todos los campos requeridos";
          setTimeout(() => {
            this.snackbar = false;
          }, 1000);
        }
      }
    },
    toggleProduct(item) {
      if (item.selected) {
        this.selectedItems.push({ ...item, quantity: item.quantity || 1 });
      } else {
        this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem.codigo !== item.codigo);
      }
    },
    // updateQuantity(item) {
    //   if (item.selected) {
    //     const selectedItem = this.selectedItems.find(selectedItem => selectedItem.codigo === item.codigo);
    //     if (selectedItem) {
    //       selectedItem.quantity = item.quantity;
    //     }
    //   }
    // }
    validateQuantity(item) {
       const maxQuantity = item.cant;
      if (item.quantity > maxQuantity) {
        item.errorMessages = [`Máximo disponible: ${maxQuantity}`];
        item.quantity = maxQuantity; // Ajusta la cantidad a la máxima disponible
      } else {
        item.errorMessages = [];
      }

      // Asegúrate de que la cantidad no sea mayor que el máximo permitido
      if (item.quantity > maxQuantity) {
        item.quantity = maxQuantity;
      }

      if (item.selected) {
        const selectedItem = this.selectedItems.find(selectedItem => selectedItem.codigo === item.codigo);
        if (selectedItem) {
          selectedItem.quantity = item.quantity;
        }
      }
    }
  },

  watch: {
    searchTerm(val) {
      console.log('Search Term:', val);
      if (val === undefined) {
        this.filteredItems = this.items;
      } else if (val.trim() === '') {
        this.filteredItems = this.items;
      } else {
        this.filteredItems = this.items.filter(
          item =>
            item.name.toLowerCase().includes(val.toLowerCase()) ||
            item.codigo.toLowerCase().includes(val.toLowerCase())
        );
      }
      console.log('Filtered Items:', this.filteredItems);
    }
  }
};
</script>

<style>
.lbl {
  padding: 0.5em;
  margin: auto;
}
</style>

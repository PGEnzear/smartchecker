<template>
  <div class="flex align-items-center gap-1">
    <component :is="selectedNetwork.icon" />
    <span class="white-space-nowrap text-overflow-ellipsis">{{ selectedNetwork.text }}</span>
  </div>
</template>

<script setup lang="ts">
import ETHIcon from "~/assets/images/eth.svg";
import BTCIcon from "~/assets/images/btc.svg";
import BCHIcon from "~/assets/images/bch.svg";
import LTCIcon from "~/assets/images/ltc.svg";
import TRXIcon from "~/assets/images/trx.svg";
import SOLIcon from "~/assets/images/sol.svg";

const props = defineProps({
  network: String
});

const networks = [
  { name: "bitcoin", icon: BTCIcon, text: "Bitcoin" },
  { name: "evm", icon: ETHIcon, text: "EVM Networks" },
  { name: "litecoin", icon: LTCIcon, text: "Litecoin" },
  { name: "bitcoin-cash", icon: BCHIcon, text: "Bitcoin Cash" },
  { name: "tron", icon: TRXIcon, text: "Tron" },
  { name: "solana", icon: SOLIcon, text: "Solana" },
];

const selectedNetwork = computed(
  () => networks.find((net) => net.name === props.network) || networks[0]
);
</script>

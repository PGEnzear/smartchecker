import mitt from "mitt";
import { Store } from "pinia";
import { Router } from "vue-router"

const emitter = mitt();
let closeIO: Function | null = null;

const setupSocketEvents = (authStore: Store<any, any>, router: Router, debounce: Function) => {
  const socket = useSocketIO();
  closeIO = socket.close;

  debounce();

  socket.io.on("reconnect", () => {
    debounce();
    emitter.emit("reconnect");
  });

  socket.on("session.confirmed", (user) => {
    authStore.user = user;
    authStore.sessionConfirmed = true;
    authStore.subscribed = true;
    authStore.loggedIn = true;
    router.push("/");
  });

  socket.on("logout", (user) => {
    authStore.user = undefined;
    authStore.sessionConfirmed = false;
    authStore.subscribed = false;
    authStore.loggedIn = false;
    router.push("/auth");
  });

  const otherEvents = ["wallet_task.processed", "wallet_task.completed"];
  otherEvents.forEach((event) => {
    socket.on(event, (data) => {
      emitter.emit(event, data);
    });
  });
};
const reconnectSocket = (authStore: Store<any, any>, router: Router, debounce: Function) => {
  try {
    if (closeIO) closeIO();
  } catch {}

  setupSocketEvents(authStore, router, debounce);
};

export default defineNuxtPlugin(async (nuxt) => {
  const pinia = usePinia();
  const authStore = useAuthStore(pinia);
  const router = useRouter();

  await authStore.fetch();
  const { debouncedFunction } = useDebouncedFunction(authStore.fetch, 100);

  emitter.on("reconnect_socket", () =>
    reconnectSocket(authStore, router, debouncedFunction)
  );
  reconnectSocket(authStore, router, debouncedFunction);

  nuxt.provide("events", {
    $on: emitter.on,
    $off: emitter.off,
    $emit: emitter.emit,
  });
});

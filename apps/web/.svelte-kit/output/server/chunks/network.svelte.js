let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
if (typeof globalThis !== "undefined" && typeof globalThis.window !== "undefined") {
  const win = globalThis.window;
  win.addEventListener("online", () => {
    isOnline = true;
    console.log("[Network] Back online");
  });
  win.addEventListener("offline", () => {
    isOnline = false;
    console.log("[Network] Gone offline");
  });
  const nav = win.navigator;
  const connection = nav.connection;
  if (connection) {
    connection.effectiveType || "unknown";
    connection.saveData || connection.effectiveType === "2g";
    connection.addEventListener("change", () => {
      connection.effectiveType;
      connection.saveData || connection.effectiveType === "2g";
    });
  }
}
const networkStatus = {
  get isOnline() {
    return isOnline;
  }
};
export {
  networkStatus as n
};

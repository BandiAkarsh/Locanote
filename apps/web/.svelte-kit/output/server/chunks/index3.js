import "./state.svelte.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import { w as writable } from "./index2.js";
import "@sveltejs/kit/internal/server";
import { g as getContext } from "./context.js";
function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
const stores = {
  updated: /* @__PURE__ */ create_updated_store()
};
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
({
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get params() {
    return context().page.params;
  },
  get status() {
    return context().page.status;
  }
};
const page = page$1;
export {
  goto as g,
  page as p
};

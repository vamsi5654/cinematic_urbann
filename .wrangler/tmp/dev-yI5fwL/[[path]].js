(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // .wrangler/tmp/bundle-N9Ka5E/checked-fetch.js
  var urls = /* @__PURE__ */ new Set();
  function checkURL(request, init) {
    const url = request instanceof URL ? request : new URL(
      (typeof request === "string" ? new Request(request, init) : request).url
    );
    if (url.port && url.port !== "443" && url.protocol === "https:") {
      if (!urls.has(url.toString())) {
        urls.add(url.toString());
        console.warn(
          `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
        );
      }
    }
  }
  __name(checkURL, "checkURL");
  globalThis.fetch = new Proxy(globalThis.fetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });

  // C:/Users/LENOVO/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  __name(__facade_register__, "__facade_register__");
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  __name(__facade_registerInternal__, "__facade_registerInternal__");
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  __name(__facade_invokeChain__, "__facade_invokeChain__");
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }
  __name(__facade_invoke__, "__facade_invoke__");

  // C:/Users/LENOVO/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  __name(__facade_isSpecialEvent__, "__facade_isSpecialEvent__");
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class ___Facade_ExtendableEvent__ extends Event {
    static {
      __name(this, "__Facade_ExtendableEvent__");
    }
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof ___Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  var __Facade_FetchEvent__ = class ___Facade_FetchEvent__ extends __Facade_ExtendableEvent__ {
    static {
      __name(this, "__Facade_FetchEvent__");
    }
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof ___Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof ___Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  var __Facade_ScheduledEvent__ = class ___Facade_ScheduledEvent__ extends __Facade_ExtendableEvent__ {
    static {
      __name(this, "__Facade_ScheduledEvent__");
    }
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof ___Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = /* @__PURE__ */ __name(function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    }, "__facade_sw_dispatch__");
    const __facade_sw_fetch__ = /* @__PURE__ */ __name(function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    }, "__facade_sw_fetch__");
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // C:/Users/LENOVO/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {
          }
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  }, "drainBody");
  var middleware_ensure_req_body_drained_default = drainBody;

  // C:/Users/LENOVO/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  __name(reduceError, "reduceError");
  var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  }, "jsonError");
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-N9Ka5E/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);

  // functions/api/[[path]].ts
  function corsHeaders(origin = "*") {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };
  }
  __name(corsHeaders, "corsHeaders");
  function handleOptions(request) {
    return new Response(null, {
      headers: corsHeaders(request.headers.get("Origin") || "*")
    });
  }
  __name(handleOptions, "handleOptions");
  async function onRequest(context) {
    const { request, env, params } = context;
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    const url = new URL(request.url);
    const path = url.pathname.replace("/api/", "");
    const headers = corsHeaders(request.headers.get("Origin") || "*");
    try {
      if (path.startsWith("auth/login") && request.method === "POST") {
        return await handleLogin(request, env, headers);
      }
      if (path === "upload" && request.method === "POST") {
        return await handleUpload(request, env, headers);
      }
      if (path === "images" && request.method === "GET") {
        return await handleGetImages(request, env, headers);
      }
      if (path.startsWith("images/") && request.method === "DELETE") {
        const imageId = path.split("/")[1];
        return await handleDeleteImage(imageId, request, env, headers);
      }
      if (path.startsWith("images/") && request.method === "PUT") {
        const imageId = path.split("/")[1];
        return await handleUpdateImage(imageId, request, env, headers);
      }
      if (path.startsWith("project/") && request.method === "GET") {
        const projectId = path.split("/")[1];
        return await handleGetProjectDetails(projectId, env, headers);
      }
      if (path === "events" && request.method === "POST") {
        return await handleCreateEvent(request, env, headers);
      }
      if (path === "events" && request.method === "GET") {
        return await handleGetEvents(env, headers);
      }
      if (path.startsWith("events/") && request.method === "DELETE") {
        const eventId = path.split("/")[1];
        return await handleDeleteEvent(eventId, request, env, headers);
      }
    } catch (error) {
      console.error("API Error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
  }
  __name(onRequest, "onRequest");
  async function handleLogin(request, env, headers) {
    const { username, password } = await request.json();
    const user = await env.DB.prepare(
      "SELECT * FROM admin_users WHERE username = ?"
    ).bind(username).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const isValid = password === "admin123";
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const token = btoa(JSON.stringify({
      userId: user.id,
      username: user.username,
      exp: Date.now() + 24 * 60 * 60 * 1e3
      // 24 hours
    }));
    await env.DB.prepare(
      "UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(user.id).run();
    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
  __name(handleLogin, "handleLogin");
  async function handleUpload(request, env, headers) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    const metadataRaw = formData.get("metadata");
    if (!metadataRaw) {
      return new Response(JSON.stringify({ error: "Missing metadata" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const metadata = JSON.parse(metadataRaw);
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const customerFolder = `${metadata.customerNumber}_${metadata.customerName.replace(/\s+/g, "_")}`;
    const categoryFolder = metadata.category.replace(/\s+/g, "");
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
    const fullPath = `uploads/${customerFolder}/${categoryFolder}/${fileName}`;
    await env.IMAGES_BUCKET.put(fullPath, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    });
    const imageUrl = `https://pub-7a6f0b58834843b5a59c1ea8c38fe6c1.r2.dev/${fullPath}`;
    const projectId = `${metadata.customerNumber}_${metadata.customerName.replace(/\s+/g, "_")}`;
    const imageId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO images (id, public_id, image_url, customer_number, customer_name, phone, category, tags, description, status, project_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      imageId,
      fullPath,
      imageUrl,
      metadata.customerNumber,
      metadata.customerName,
      metadata.phone,
      metadata.category,
      JSON.stringify(metadata.tags || []),
      metadata.description || "",
      metadata.status || "draft",
      projectId
    ).run();
    return new Response(JSON.stringify({
      success: true,
      image: {
        id: imageId,
        imageUrl,
        publicId: fullPath,
        projectId,
        ...metadata
      }
    }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
  __name(handleUpload, "handleUpload");
  async function handleGetImages(request, env, headers) {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "published";
    const category = url.searchParams.get("category");
    let query = "SELECT * FROM images WHERE status = ?";
    const params = [status];
    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }
    query += " ORDER BY uploaded_at DESC";
    const { results } = await env.DB.prepare(query).bind(...params).all();
    const images = results.map((img) => ({
      id: img.id,
      imageUrl: img.image_url,
      // ✅ IMPORTANT
      publicId: img.public_id,
      customerNumber: img.customer_number,
      customerName: img.customer_name,
      phone: img.phone,
      category: img.category,
      tags: JSON.parse(img.tags || "[]"),
      description: img.description,
      status: img.status,
      projectId: img.project_id,
      uploadedAt: img.uploaded_at
      // ✅ IMPORTANT
    }));
    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
  __name(handleGetImages, "handleGetImages");
  async function handleCreateEvent(request, env, headers) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const {
      title,
      message,
      imageUrl,
      scheduledDate,
      scheduledTime,
      active
    } = body;
    if (!title || !message || !scheduledDate || !scheduledTime) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
    INSERT INTO events (
      id,
      title,
      message,
      image_url,
      scheduled_date,
      scheduled_time,
      active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
      crypto.randomUUID(),
      title,
      message,
      imageUrl || null,
      scheduledDate,
      scheduledTime,
      active ? 1 : 0
    ).run();
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      }
    );
  }
  __name(handleCreateEvent, "handleCreateEvent");
  async function handleDeleteEvent(eventId, request, env, headers) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const event = await env.DB.prepare("SELECT id FROM events WHERE id = ?").bind(eventId).first();
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(eventId).run();
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      }
    );
  }
  __name(handleDeleteEvent, "handleDeleteEvent");
  async function handleGetEvents(env, headers) {
    const { results } = await env.DB.prepare(`SELECT * FROM events ORDER BY scheduled_date DESC`).all();
    return new Response(
      JSON.stringify({ events: results }),
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
  __name(handleGetEvents, "handleGetEvents");
  async function handleDeleteImage(imageId, request, env, headers) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const image = await env.DB.prepare(
      "SELECT * FROM images WHERE id = ?"
    ).bind(imageId).first();
    if (!image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    await env.IMAGES_BUCKET.delete(image.public_id);
    await env.DB.prepare("DELETE FROM images WHERE id = ?").bind(imageId).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
  __name(handleDeleteImage, "handleDeleteImage");
  async function handleUpdateImage(imageId, request, env, headers) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const updates = await request.json();
    await env.DB.prepare(
      `UPDATE images 
     SET customer_name = ?, phone = ?, category = ?, tags = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
    ).bind(
      updates.customerName,
      updates.phone,
      updates.category,
      JSON.stringify(updates.tags || []),
      updates.description || "",
      updates.status,
      imageId
    ).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
  __name(handleUpdateImage, "handleUpdateImage");
  async function handleGetProjectDetails(projectId, env, headers) {
    const { results: images } = await env.DB.prepare(
      "SELECT * FROM images WHERE project_id = ? AND status = ? ORDER BY category, uploaded_at DESC"
    ).bind(projectId, "published").all();
    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
    const firstImage = images[0];
    const parsedImages = images.map((img) => ({
      ...img,
      tags: JSON.parse(img.tags || "[]"),
      uploadedAt: img.uploaded_at
    }));
    const imagesByCategory = parsedImages.reduce((acc, img) => {
      if (!acc[img.category]) {
        acc[img.category] = [];
      }
      acc[img.category].push(img.image_url);
      return acc;
    }, {});
    const project = {
      id: projectId,
      customerNumber: firstImage.customer_number,
      customerName: firstImage.customer_name,
      phone: firstImage.phone,
      description: firstImage.description || `Project for ${firstImage.customer_name}`,
      categories: Object.keys(imagesByCategory),
      imagesByCategory,
      allImages: parsedImages.map((img) => img.image_url),
      year: new Date(firstImage.uploaded_at).getFullYear().toString()
    };
    return new Response(JSON.stringify({
      project,
      images: parsedImages
    }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
  __name(handleGetProjectDetails, "handleGetProjectDetails");
})();
//# sourceMappingURL=%5B%5Bpath%5D%5D.js.map

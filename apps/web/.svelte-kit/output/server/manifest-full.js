export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","manifest.json","service-worker.js"]),
	mimeTypes: {".svg":"image/svg+xml",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.BmLLv6gO.js",app:"_app/immutable/entry/app.DW8yodMn.js",imports:["_app/immutable/entry/start.BmLLv6gO.js","_app/immutable/chunks/CZjifAYM.js","_app/immutable/chunks/BKD1GJOj.js","_app/immutable/chunks/BGFLlG_M.js","_app/immutable/entry/app.DW8yodMn.js","_app/immutable/chunks/BKD1GJOj.js","_app/immutable/chunks/BHb5Aufh.js","_app/immutable/chunks/Bgm4i-1x.js","_app/immutable/chunks/BGFLlG_M.js","_app/immutable/chunks/D94Q0doQ.js","_app/immutable/chunks/Dgn6swut.js","_app/immutable/chunks/UwCaOVvE.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/app",
				pattern: /^\/app\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/app/note/[id]",
				pattern: /^\/app\/note\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

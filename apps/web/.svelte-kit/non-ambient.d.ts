
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/app" | "/app/note" | "/app/note/[id]";
		RouteParams(): {
			"/app/note/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/app": { id?: string };
			"/app/note": { id?: string };
			"/app/note/[id]": { id: string }
		};
		Pathname(): "/" | "/app" | "/app/" | "/app/note" | "/app/note/" | `/app/note/${string}` & {} | `/app/note/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | "/manifest.json" | string & {};
	}
}
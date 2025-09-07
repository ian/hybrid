declare module "degit" {
	interface DegitEmitter {
		clone(dest: string): Promise<void>
	}

	function degit(src: string): DegitEmitter
	export = degit
}

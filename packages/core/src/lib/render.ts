import { Eta } from "eta"

export const eta = new Eta({
	views: "templates"
})

export const render = (template: string, runtime: Record<string, unknown>) => {
	return eta.renderString(template, runtime)
}

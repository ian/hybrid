import clsx from "clsx"
import SoonRibbon from "./SoonRibbon"

export default function Quickstarts() {
	return (
		<div className="grid grid-cols-3 gap-5">
			{FRAMEWORKS.map((f) => (
				<div key={f.name} className="relative">
					{f.soon && <SoonRibbon />}

					<a
						className={clsx(
							"p-5 space-y-2 block h-full",
							f.soon ? "opacity-50" : "hover:scale-105",
							"relative transition-all duration-150 bg-blue-900 bg-opacity-50 cursor-pointer rounded-xl"
						)}
						href={f.url}
					>
						<div className="flex items-center h-10">{f.image}</div>
						<h4 className="text-white">{f.name}</h4>
						<p className="text-sm">{f.description}</p>
					</a>
				</div>
			))}
		</div>
	)
}

const FRAMEWORKS = [
	{
		name: "Next.js",
		description: "The React Framework for Production",
		url: "/docs/quickstart/nextjs",
		image: <img src="/docs/nextjs.svg" alt="Next.js" className="h-8" />
	},
	{
		name: "React",
		description:
			"Get started with React in a new or existing Create React App project.",
		url: "/docs/quickstart/react",
		image: <img src="/docs/react.svg" alt="React" className="h-7" />
	},
	{
		name: "React Native",
		description:
			"Use Hybrid with Expo to build Web3-enabled React Native apps.",
		// url: "/docs/quickstart/expo",
		image: <img src="/docs/expo.svg" alt="Remix" className="h-6" />,
		soon: true
	}
	// {
	// 	name: "Remix",
	// 	description:
	// 		"Remix is a framework for building web apps with React and the Jamstack.",
	// 	// url: "/docs/quickstart/remix",
	// 	image: <img src="/docs/remix.svg" alt="Remix" className="h-6" />,
	// 	soon: true
	// },
	// {
	// 	name: "Redwood",
	// 	description:
	// 		"Remix is a framework for building web apps with React and the Jamstack.",
	// 	// url: "/docs/quickstart/redwood",
	// 	image: <img src="/docs/redwood.svg" alt="Remix" className="h-6" />,
	// 	soon: true
	// },
	// {
	// 	name: "Remix",
	// 	description:
	// 		"Remix is a framework for building web apps with React and the Jamstack.",
	// 	// url: "/docs/quickstart/gatsby",
	// 	image: <img src="/docs/gatsby.svg" alt="Remix" className="h-6" />,
	// 	soon: true
	// },
	// {
	// 	name: "React Native",
	// 	description:
	// 		"Remix is a framework for building web apps with React and the Jamstack.",
	// 	// url: "/docs/quickstart/expo",
	// 	image: <img src="/docs/expo.svg" alt="Remix" className="h-6" />,
	// 	soon: true
	// }
]

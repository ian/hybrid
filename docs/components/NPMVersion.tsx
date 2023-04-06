import React from "react"

export default function NPMVersion() {
	const [version, setVersion] = React.useState<string>()

	React.useEffect(() => {
		fetch("https://registry.npmjs.org/hybrid")
			.then((res) => res.json())
			.then((json) => Object.keys(json.versions))
			.then((versions) => versions[versions.length - 1])
			.then((version) => setVersion(version))
	}, [])

	return <span>v{version}</span>
}

import "~/styles/globals.css"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"

import DocsLayout from "~/components/DocsLayout"
import Opener from "~/components/Opener"

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter()

	if (router.pathname === "/_error") {
		return <Component {...pageProps} />
	}

	return (
		<>
			{/* For homepage, add the opener -> scroll down to docs */}
			{router.pathname === "/" && (
				<>
					<Opener />
					<a id="welcome" />
				</>
			)}

			<DocsLayout>
				<Component {...pageProps} />
			</DocsLayout>
		</>
	)
}

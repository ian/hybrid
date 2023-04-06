import clsx from "clsx"
import styles from "./Ribbon.module.css"

export default function Ribbon({ className }: { className?: string }) {
	return (
		// <div className={clsx(className, styles.ribbon, styles.ribbonTopLeft)}>
		// 	<span>SOON</span>
		// </div>
		<div className={styles.CornerRibbon}>
			<div className={styles.CornerRibbonInner}>
				<div className={styles.CornerRibbonContent}>SOON</div>
			</div>
		</div>
	)
}

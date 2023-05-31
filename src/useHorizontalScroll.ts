import { useEffect, useRef } from 'react'

export const useHorizontalScroll = <T extends HTMLElement>() => {
	const elementRef = useRef<T>(null)

	useEffect(() => {
		const element = elementRef.current

		if (element) {
			const onWheel = (e: any) => {
				if (e.deltaY == 0) return

				e.preventDefault()
				element.scrollTo({
					left: element.scrollLeft + e.deltaY,
					behavior: 'smooth'
				})
			}

			element.addEventListener('wheel', onWheel)

			return () => element.removeEventListener('wheel', onWheel)
		}
	}, [])

	return elementRef
}

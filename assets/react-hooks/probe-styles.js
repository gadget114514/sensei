import { useState, useEffect, useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { mapValues, keyBy } from 'lodash';

import { hexToRGB } from '../shared/helpers/colors';

const { getComputedStyle } = window;

/**
 * Get color slugs by probe.
 *
 * @return {Object} Object containing the color slugs, where the key is the probe key.
 */
const useColorSlugsByProbe = () => {
	const themeColorPalette = useSelect(
		( select ) => select( 'core/editor' ).getEditorSettings().colors,
		[]
	);
	const probeStyles = useProbeStyles();
	const [ colorSlugsByProbe, setColorSlugsByProbe ] = useState( {} );

	useEffect( () => {
		const newState = {};
		const slugsByColor = mapValues(
			keyBy( themeColorPalette, ( item ) => hexToRGB( item.color ) ),
			'slug'
		);

		Object.entries( probeStyles ).forEach( ( [ key, color ] ) => {
			const colorSlug = slugsByColor[ hexToRGB( color ) ];

			if ( colorSlug ) {
				newState[ key ] = colorSlug;
			}
		} );

		setColorSlugsByProbe( newState );
	}, [ themeColorPalette, probeStyles ] );

	return colorSlugsByProbe;
};

/**
 * Hook to set the default color attribute in a block, based on the theme
 * colors and the probe.
 *
 * @param {string}   currentColor  Current color.
 * @param {string}   attributeKey  Attribute key where the color is saved.
 * @param {string}   probeKey      Probe key to get the desired color.
 * @param {Function} setAttributes Set attributes function.
 */
export const useDefaultColor = (
	currentColor,
	attributeKey,
	probeKey,
	setAttributes
) => {
	const colorSlugsByProbe = useColorSlugsByProbe();

	useEffect( () => {
		const defaultColor = colorSlugsByProbe[ probeKey ];

		if ( ! currentColor ) {
			setAttributes( {
				[ attributeKey ]: defaultColor ? defaultColor : undefined,
			} );
		}
	}, [
		currentColor,
		attributeKey,
		probeKey,
		setAttributes,
		colorSlugsByProbe,
	] );
};

/**
 * Probe styles hook.
 *
 * It adds elements to the DOM as a probe, and get the computed styles
 * the default expected properties.
 *
 * @return {Object} Probe default styles.
 */
const useProbeStyles = () => {
	const [ probeStyles, setProbeStyles ] = useState( {} );

	const getProbeStyles = useCallback( () => {
		// Create temporary probe elements.
		const editorStylesWrapperDiv = document.createElement( 'div' );
		editorStylesWrapperDiv.className =
			'editor-styles-wrapper sensei-probe-element';

		const blockButtonDiv = document.createElement( 'div' );
		blockButtonDiv.className = 'wp-block-button';

		const buttonLinkDiv = document.createElement( 'div' );
		buttonLinkDiv.className = 'wp-block-button__link';
		buttonLinkDiv.textContent = 'Probe';

		// Set probe position outside the screen to be hidden.
		editorStylesWrapperDiv.style.position = 'fixed';
		editorStylesWrapperDiv.style.top = '-100vh';

		// Add probe to the screen.
		blockButtonDiv.appendChild( buttonLinkDiv );
		editorStylesWrapperDiv.appendChild( blockButtonDiv );
		document.body.appendChild( editorStylesWrapperDiv );

		// Save styles.
		const styles = {
			primaryColor: getComputedStyle( buttonLinkDiv ).backgroundColor,
			primaryContrastColor: getComputedStyle( buttonLinkDiv ).color,
		};

		// Remove probe.
		document.body.removeChild( editorStylesWrapperDiv );

		return styles;
	}, [] );

	useEffect( () => {
		setProbeStyles( getProbeStyles() );
	}, [ getProbeStyles ] );

	return probeStyles;
};

export default useProbeStyles;

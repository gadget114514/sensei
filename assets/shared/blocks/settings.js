import { useEffect } from '@wordpress/element';
import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings,
	withColors,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { mapValues, upperFirst } from 'lodash';

import { useColorSlugsByProbe } from '../../react-hooks/probe-styles';

/**
 * Add color customization support and block settings controls for colors.
 *
 * @param {Object} colorSettings
 */
export const withColorSettings = ( colorSettings ) => {
	return ( Component ) => {
		const ComponentWithColorSettings = ( props ) => (
			<>
				<Component { ...props } />
				<ColorSettings { ...{ colorSettings, props } } />
			</>
		);

		const colors = mapValues(
			colorSettings,
			( settings ) => settings.style
		);

		return withColors( colors )( ComponentWithColorSettings );
	};
};

/**
 * Color setting inspector controls.
 *
 * @param {Object} params
 * @param {Object} params.colorSettings Color definitions.
 * @param {Object} params.props         Component props
 * @class
 */
export const ColorSettings = ( { colorSettings, props } ) => {
	const colors = Object.keys( colorSettings );
	return (
		<InspectorControls>
			<PanelColorSettings
				title={ __( 'Color settings', 'sensei-lms' ) }
				initialOpen={ false }
				colorSettings={ colors.map( ( color ) => ( {
					value: props[ color ].color,
					label: colorSettings[ color ].label,
					onChange: props[ `set${ upperFirst( color ) }` ],
				} ) ) }
			>
				{ props.backgroundColor && props.textColor && (
					<ContrastChecker
						{ ...{
							textColor: props.textColor.color,
							backgroundColor: props.backgroundColor.color,
						} }
						isLargeText={ false }
					/>
				) }
			</PanelColorSettings>
		</InspectorControls>
	);
};

/**
 * Apply default style class if no style is selected.
 * Adds is-style-default to the className property.
 */
export const withDefaultBlockStyle = () => ( Component ) => ( props ) => {
	let { className } = props;

	const extraProps = {};

	if ( ! className || ! className.includes( 'is-style-' ) ) {
		className = extraProps.className = [
			className,
			'is-style-default',
		].join( ' ' );
	}

	const style = className.match( /is-style-(\w+)/ );
	if ( style ) extraProps.blockStyle = style[ 1 ];

	return <Component { ...props } { ...extraProps } />;
};

/**
 * This HOC sets the default color attribute to a value based in a probe.
 *
 * @param {Object} colorsConfig Colors config object, where the key is the
 *                              default color attribute name, and the value is
 *                              the probe key.
 *                              The block attributes must register an attribute
 *                              for every key.
 *
 * @return {Function} Extended component.
 */
export const withDefaultColor = ( colorsConfig ) => ( Component ) => (
	props
) => {
	const { setAttributes, attributes } = props;
	const colorSlugsByProbe = useColorSlugsByProbe();

	const colorDeps = Object.keys( colorsConfig ).map(
		( key ) => attributes[ key ]
	);

	useEffect( () => {
		Object.entries( colorsConfig ).forEach( ( [ colorKey, probeKey ] ) => {
			const probeColorSlug = colorSlugsByProbe[ probeKey ];

			if ( probeColorSlug && attributes[ colorKey ] !== probeColorSlug ) {
				setAttributes( {
					[ colorKey ]: probeColorSlug,
				} );
			}
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- The deps are added dynamically because we get it dynamically from the attributes and we don't want add all attributes as dep.
	}, [ colorSlugsByProbe, setAttributes, ...colorDeps ] );

	return <Component { ...props } />;
};

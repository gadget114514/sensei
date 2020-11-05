import { InnerBlocks, RichText } from '@wordpress/block-editor';
import { Icon } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { useContext, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import AnimateHeight from 'react-animate-height';
import { chevronUp } from '../../../icons/wordpress-icons';

import { withColorSettings } from '../../../shared/blocks/settings';
import { OutlineAttributesContext } from '../course-block/edit';
import SingleLineInput from '../single-line-input';
import { ModuleStatus } from './module-status';
import { ModuleBlockSettings } from './settings';
import { useInsertLessonBlock } from './use-insert-lesson-block';
import { dispatch } from '@wordpress/data';
import { applyParentStyle } from '../apply-parent-style';

/**
 * Edit module block component.
 *
 * @param {Object}   props                        Component props.
 * @param {string}   props.clientId               The module block id.
 * @param {string}   props.className              Custom class name.
 * @param {Object}   props.attributes             Block attributes.
 * @param {string}   props.attributes.title       Module title.
 * @param {string}   props.attributes.description Module description.
 * @param {string}   props.attributes.blockStyle  Selected block style.
 * @param {Object}   props.mainColor              Header main color.
 * @param {Object}   props.textColor              Header text color.
 * @param {Object}   props.borderColor            Border color.
 * @param {Function} props.setAttributes          Block set attributes function.
 */
export const EditModuleBlock = ( props ) => {
	const {
		clientId,
		className,
		attributes: { title, description, bordered, borderColorValue },
		mainColor,
		textColor,
		setAttributes,
		name,
	} = props;
	const {
		outlineAttributes: { collapsibleModules, moduleBorder },
	} = useContext( OutlineAttributesContext ) || { outlineAttributes: {} };

	useInsertLessonBlock( props );

	const [ outlineClass, setOutlineClass ] = useState( null );

	// setOutlineClass is called when there is an update in course style class only.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect( () => {
		applyParentStyle(
			'sensei-lms/course-outline',
			name,
			clientId,
			outlineClass,
			setOutlineClass
		);
	} );

	// Get the border setting from the parent if none is set.
	if ( undefined === bordered ) {
		setAttributes( { bordered: moduleBorder } );
	}

	/**
	 * Handle update name.
	 *
	 * @param {string} value Name value.
	 */
	const updateName = ( value ) => {
		setAttributes( { title: value } );
	};

	/**
	 * Handle update description.
	 *
	 * @param {string} value Description value.
	 */
	const updateDescription = ( value ) => {
		setAttributes( { description: value } );
	};

	const [ isExpanded, setExpanded ] = useState( true );

	let blockStyleColors = {};
	const style = className.match( /is-style-(\w+)/ );

	if ( style ) {
		blockStyleColors = {
			default: { background: mainColor?.color },
			minimal: { borderColor: mainColor?.color },
		}[ style[ 1 ] ];
	}

	return (
		<>
			<ModuleBlockSettings
				bordered={ bordered }
				setBordered={ ( newValue ) =>
					setAttributes( { bordered: newValue } )
				}
			/>
			<section
				className={ classnames( className, {
					'sensei-module-bordered': bordered,
				} ) }
				style={ { borderColor: borderColorValue } }
			>
				<header
					className="wp-block-sensei-lms-course-outline-module__header"
					style={ { ...blockStyleColors, color: textColor?.color } }
				>
					<h2 className="wp-block-sensei-lms-course-outline-module__title">
						<SingleLineInput
							className="wp-block-sensei-lms-course-outline-module__title-input"
							placeholder={ __( 'Module name', 'sensei-lms' ) }
							value={ title }
							onChange={ updateName }
						/>
					</h2>
					<ModuleStatus clientId={ clientId } />
					{ collapsibleModules && (
						<button
							type="button"
							className={ classnames(
								'wp-block-sensei-lms-course-outline__arrow',
								{ collapsed: ! isExpanded }
							) }
							onClick={ () => setExpanded( ! isExpanded ) }
						>
							<Icon icon={ chevronUp } />
							<span className="screen-reader-text">
								{ __( 'Toggle module content', 'sensei-lms' ) }
							</span>
						</button>
					) }
				</header>
				<AnimateHeight
					className="wp-block-sensei-lms-collapsible"
					duration={ 500 }
					animateOpacity
					height={ ! collapsibleModules || isExpanded ? 'auto' : 0 }
				>
					<div className="wp-block-sensei-lms-course-outline-module__description">
						<RichText
							className="wp-block-sensei-lms-course-outline-module__description-input"
							placeholder={ __(
								'Module description',
								'sensei-lms'
							) }
							value={ description }
							onChange={ updateDescription }
						/>
					</div>
					<h3 className="wp-block-sensei-lms-course-outline-module__lessons-title">
						{ __( 'Lessons', 'sensei-lms' ) }
					</h3>
					<InnerBlocks
						allowedBlocks={ [ 'sensei-lms/course-outline-lesson' ] }
						templateInsertUpdatesSelection={ false }
						renderAppender={ () => null }
					/>
				</AnimateHeight>
			</section>
		</>
	);
};

export default compose(
	withColorSettings( {
		mainColor: {
			style: 'background-color',
			label: __( 'Main color', 'sensei-lms' ),
		},
		textColor: { style: 'color', label: __( 'Text color', 'sensei-lms' ) },
		borderColor: {
			style: 'border-color',
			label: __( 'Border color', 'sensei-lms' ),
			onChange: ( { clientId, colorValue } ) =>
				dispatch( 'core/block-editor' ).updateBlockAttributes(
					clientId,
					{ borderColorValue: colorValue, bordered: !! colorValue }
				),
		},
	} )
)( EditModuleBlock );

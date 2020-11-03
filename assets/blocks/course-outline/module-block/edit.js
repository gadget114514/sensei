import { InnerBlocks, RichText } from '@wordpress/block-editor';
import { Icon } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import AnimateHeight from 'react-animate-height';

import { chevronUp } from '../../../icons/wordpress-icons';
import {
	withColorSettings,
	withDefaultBlockStyle,
	withDefaultColor,
} from '../../../shared/blocks/settings';
import { OutlineAttributesContext } from '../course-block/edit';
import SingleLineInput from '../single-line-input';
import { ModuleStatus } from './module-status';
import { ModuleBlockSettings } from './settings';
import { useInsertLessonBlock } from './use-insert-lesson-block';

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
 * @param {Object}   props.defaultMainColor       Default main color.
 * @param {Object}   props.textColor              Header text color.
 * @param {Object}   props.defaultTextColor       Default text color.
 * @param {Function} props.setAttributes          Block set attributes function.
 */
export const EditModuleBlock = ( props ) => {
	const {
		clientId,
		className,
		attributes: { title, description },
		mainColor,
		defaultMainColor,
		textColor,
		defaultTextColor,
		setAttributes,
		blockStyle,
	} = props;
	const {
		outlineAttributes: { collapsibleModules },
	} = useContext( OutlineAttributesContext ) || { outlineAttributes: {} };

	useInsertLessonBlock( props );

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

	// Header styles.
	const headerClassNames = classnames(
		'wp-block-sensei-lms-course-outline-module__header',
		{
			[ defaultMainColor?.className ]:
				! mainColor?.color && 'minimal' !== blockStyle,
			[ defaultTextColor?.className ]:
				! textColor?.color && 'minimal' !== blockStyle,
		}
	);
	const headerStyles = {
		...( 'default' === blockStyle && { background: mainColor?.color } ),
		color: textColor?.color,
	};

	// Minimal border styles.
	let minimalBorder;
	if ( 'minimal' === blockStyle ) {
		const borderClassNames = classnames(
			'wp-block-sensei-lms-course-outline-module__name__minimal-border',
			{
				[ defaultMainColor?.className ]: ! mainColor?.color,
			}
		);
		const borderStyles = { background: mainColor?.color };

		minimalBorder = (
			<div className={ borderClassNames } style={ borderStyles } />
		);
	}

	return (
		<>
			<ModuleBlockSettings { ...props } />
			<section className={ className }>
				<header className={ headerClassNames } style={ headerStyles }>
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
				{ minimalBorder }
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
	} ),
	withDefaultBlockStyle(),
	withDefaultColor( {
		defaultMainColor: {
			style: 'background-color',
			probeKey: 'primaryColor',
		},
		defaultTextColor: {
			style: 'color',
			probeKey: 'primaryContrastColor',
		},
	} )
)( EditModuleBlock );

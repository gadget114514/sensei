import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { StatusControl, Status, StatusLabels } from '../status-control';
import { COURSE_STATUS_STORE } from '../status-store';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Module status preview with setting control.
 *
 * @param {Object} props          Component props
 * @param {string} props.clientId The module block id.
 */
export const ModuleStatus = ( { clientId } ) => {
	const { setModuleStatus } = useDispatch( COURSE_STATUS_STORE );
	const status = useSelect(
		( select ) => select( COURSE_STATUS_STORE ).getModuleStatus( clientId ),
		[ clientId ]
	);

	const lessonIds = useSelect(
		( select ) =>
			select( 'core/block-editor' ).getClientIdsOfDescendants( [
				clientId,
			] ),
		[ clientId ]
	);

	const options =
		lessonIds.length > 1
			? [ Status.NOT_STARTED, Status.IN_PROGRESS, Status.COMPLETED ]
			: [ Status.NOT_STARTED, Status.COMPLETED ];

	const showIndicator = Status.NOT_STARTED !== status;

	const indicator = (
		<div
			className={ classnames(
				'wp-block-sensei-lms-course-outline-module__progress-indicator',
				status
			) }
		>
			<span className="wp-block-sensei-lms-course-outline-module__progress-indicator__text">
				{ StatusLabels[ status ] }
			</span>
		</div>
	);

	return (
		<>
			{ showIndicator && indicator }
			<InspectorControls>
				<PanelBody
					title={ __( 'Status', 'sensei-lms' ) }
					initialOpen={ false }
				>
					<StatusControl
						options={ options }
						status={ status }
						setStatus={ ( newStatus ) => {
							setModuleStatus( clientId, newStatus );
						} }
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
};
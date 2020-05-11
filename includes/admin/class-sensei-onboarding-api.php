<?php
/**
 * Setup Wizard REST API.
 *
 * @package Sensei\SetupWizard
 * @since   3.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Sensei Setup Wizard REST API endpoints.
 *
 * @package Sensei
 * @author  Automattic
 * @since   3.1.0
 */
class Sensei_Setup_Wizard_API {

	/**
	 * Main Setup Wizard instance.
	 *
	 * @var Sensei_Onboarding
	 */
	private $setupwizard;

	const PURPOSES = [ 'share_knowledge', 'generate_income', 'promote_business', 'provide_certification', 'train_employees', 'other' ];

	/**
	 * Sensei_Setup_Wizard_API constructor.
	 *
	 * @param Sensei_Onboarding $setupwizard Setup Wizard instance.
	 */
	public function __construct( $setupwizard ) {
		$this->setupwizard = $setupwizard;
	}

	/**
	 * Register the REST API endpoints for Setup Wizard.
	 */
	public function register() {
		$common = [
			'endpoint' => [
				'permission_callback' => [ $this, 'can_user_access_rest_api' ],
			],
			'arg'      => [
				'validate_callback' => 'rest_validate_request_arg',
			],
		];

		$welcome_endpoint = [
			[
				'methods'  => 'GET',
				'callback' => [ $this, 'welcome_get' ],
			],
			[
				'methods'  => 'POST',
				'callback' => [ $this, 'welcome_submit' ],
				'args'     => [
					'usage_tracking' => [
						'required' => true,
						'type'     => 'boolean',
					],
				],
			],
		];

		$purpose_endpoint = [
			[
				'methods'  => 'GET',
				'callback' => [ $this, 'purpose_get' ],
			],
			[
				'methods'  => 'POST',
				'callback' => [ $this, 'purpose_submit' ],
				'args'     => [
					'selected' => [
						'required' => true,
						'type'     => 'array',
						'items'    => [
							'type' => 'string',
							'enum' => self::PURPOSES,
						],
					],
					'other'    => [
						'required' => true,
						'type'     => 'string',
					],
				],
			],
		];

		$features_endpoint = [
			[
				'methods'  => 'GET',
				'callback' => [ $this, 'features_get' ],
			],
			[
				'methods'  => 'POST',
				'callback' => [ $this, 'features_submit' ],
				'args'     => [
					'selected' => [
						'required' => true,
						'type'     => 'array',
						'items'    => [
							'type' => 'string',
							'enum' => $this->setupwizard->plugin_slugs,
						],
					],
				],
			],
		];

		Sensei_REST_API_Helper::register_endpoints(
			'sensei-internal/v1',
			[
				'onboarding/welcome'  => $welcome_endpoint,
				'onboarding/purpose'  => $purpose_endpoint,
				'onboarding/features' => $features_endpoint,
			],
			$common
		);
	}

	/**
	 * Check user permission for REST API access.
	 *
	 * @return bool Whether the user can access the Setup Wizard REST API.
	 */
	public function can_user_access_rest_api() {
		return current_user_can( 'manage_sensei' );
	}


	/**
	 * Welcome step data.
	 *
	 * @return array Data used on purpose step.
	 */
	public function welcome_get() {
		return [
			'usage_tracking' => Sensei()->usage_tracking->get_tracking_enabled(),
		];
	}

	/**
	 * Submit form on welcome step.
	 *
	 * @param array $data Form data.
	 *
	 * @return bool Success.
	 */
	public function welcome_submit( $data ) {
		Sensei()->usage_tracking->set_tracking_enabled( (bool) $data['usage_tracking'] );
		$this->setupwizard->pages->create_pages();

		return true;
	}

	/**
	 * Purpose step data.
	 *
	 * @return array Data used on purpose step.
	 */
	public function purpose_get() {
		$data = $this->setupwizard->get_wizard_user_data();

		return [
			'selected' => $data['purpose'],
			'other'    => $data['purpose_other'],
		];
	}

	/**
	 * Submit form on purpose step.
	 *
	 * @param array $form Form data.
	 *
	 * @return bool Success.
	 */
	public function purpose_submit( $form ) {

		return $this->setupwizard->update_wizard_user_data(
			[
				'purpose'       => $form['selected'],
				'purpose_other' => ( in_array( 'other', $form['selected'], true ) ? $form['other'] : '' ),
			]
		);
	}


	/**
	 * Feature step data.
	 *
	 * @return array Data used on features page.
	 */
	public function features_get() {
		$data = $this->setupwizard->get_wizard_user_data();

		return [
			'selected' => $data['features'],
			'plugins'  => $this->setupwizard->plugin_slugs,
		];
	}

	/**
	 * Submit form on features step.
	 *
	 * @param array $data Form data.
	 *
	 * @return bool Success.
	 */
	public function features_submit( $data ) {
		return $this->setupwizard->update_wizard_user_data(
			[
				'features' => $data['selected'],
			]
		);
	}


}
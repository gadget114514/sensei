import { render } from '@testing-library/react';
import useProbeStyles from './use-probe-styles';

describe( 'useProbeStyles', () => {
	it( 'Should get the probe styles', () => {
		const TestComponent = () => {
			const probeStyles = useProbeStyles();
			return (
				<>
					<style>
						{ `.wp-block-button__link {
							background-color: rgb(0, 0, 0);
							color: rgb(255, 255, 255);
						}` }
					</style>
					<div
						data-testid="styled-element"
						style={ {
							backgroundColor: probeStyles.primaryColor,
							color: probeStyles.primaryContrastColor,
						} }
					/>
				</>
			);
		};

		const { getByTestId } = render( <TestComponent /> );

		expect( getByTestId( 'styled-element' ).style.backgroundColor ).toEqual(
			'rgb(0, 0, 0)'
		);
		expect( getByTestId( 'styled-element' ).style.color ).toEqual(
			'rgb(255, 255, 255)'
		);
	} );
} );

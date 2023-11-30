import { render } from '@testing-library/react';

import App from '../App';

describe('App', () => {
  test('that it renders successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should say Howdy', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Howdy/gi)).toBeTruthy();
  });
});

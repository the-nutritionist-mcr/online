import "jest-date";
import { createSerializer, matchers as emotionMatchers } from '@emotion/jest';
import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';
import 'jest-enzyme';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

beforeEach(() => {
  process.env["LOG_LEVEL"] = "fatal";
});

// eslint-disable-next-line fp/no-unused-expression
expect.extend(emotionMatchers);

// eslint-disable-next-line fp/no-unused-expression
Enzyme.configure({ adapter: new Adapter() });

// eslint-disable-next-line fp/no-unused-expression
expect.addSnapshotSerializer(createSerializer());



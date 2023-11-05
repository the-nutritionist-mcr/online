import "jest-date";
import { createSerializer, matchers as emotionMatchers } from "@emotion/jest";
import "jest-styled-components";
import "@testing-library/jest-dom/extend-expect";
import "jest-enzyme";
import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

expect.extend(emotionMatchers);
Enzyme.configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createSerializer());

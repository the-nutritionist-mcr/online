import { FC } from 'react';

import { Pricing as PricingComponent } from '@tnmo/static-pages';

const OurStory: FC = () => {
  return process.env['APP_VERSION'] === 'prod' ? <PricingComponent /> : <></>;
};

export default OurStory;

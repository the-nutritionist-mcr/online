import { LoadingContext } from '@tnmo/components';
import { StackConfig } from '@tnmo/types';
import { getAppConfig } from '@tnmo/core';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ConfigContextType {
  config?: StackConfig;
}

interface ConfigContextProviderProps {
  children: ReactNode;
}

export const ConfigContext = createContext<ConfigContextType>({});

const CONFIG_LOADER = 'config';

export const ConfigProvider = (props: ConfigContextProviderProps) => {
  const { useLoading } = useContext(LoadingContext);
  const { stopLoading } = useLoading(CONFIG_LOADER);

  const [config, setConfig] = useState<StackConfig | undefined>();
  useEffect(() => {
    (async () => {
      setConfig(await getAppConfig());
      stopLoading();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ConfigContext.Provider value={{ config }}>
      {props.children}
    </ConfigContext.Provider>
  );
};
